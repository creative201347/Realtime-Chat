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
import { createServer } from "http";
import { ApolloServer } from "apollo-server-express";
import { IGraphqlContext, ISession, ISubscriptionContext } from "./types";

async function main() {
  dotenv.config();

  // Create the schema, which will be used separately by ApolloServer and the WebSocket server.
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  // Create an Express app and HTTP server; we will attach both the WebSocket server and the ApolloServer to this HTTP server.
  const app = express();
  const httpServer = createServer(app);

  // Create our WebSocket server using the HTTP server we just set up.
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql/subscriptions",
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
