import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";

import { makeExecutableSchema } from "@graphql-tools/schema";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { PubSub } from "graphql-subscriptions";

import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";

import express from "express";
import http from "http";
import { ApolloServer } from "apollo-server-express";
import { IGraphqlContext, ISession, ISubscriptionContext } from "./types";

async function main() {
  const app = express();
  dotenv.config();

  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  /*---------- Context Parameters ----------*/
  const prisma = new PrismaClient();
  const pubsub = new PubSub();

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx: ISubscriptionContext): Promise<IGraphqlContext> => {
        if (ctx.connectionParams && ctx.connectionParams.session) {
          const { session } = ctx.connectionParams;
          return { session, prisma, pubsub };
        }

        return { session: null, prisma, pubsub };
      },
    },
    wsServer
  );

  const corsOptions = {
    origin: process.env.BASE_URL || "http://localhost:3000",
    credentials: true,
  };

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: "bounded",
    context: async ({ req, res }): Promise<IGraphqlContext> => {
      const session = (await getSession({ req })) as ISession;
      return { session, prisma, pubsub };
    },
    plugins: [
      /*------- Proper shutdown for the HTTP server --------*/
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
      /*-------- Proper shutdown for the WebSocket server --------*/
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });

  await server.start();
  server.applyMiddleware({ app, cors: corsOptions });
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log(`http://localhost:4000${server.graphqlPath}`);
}
main().catch((err) => console.log(err));
