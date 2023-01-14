import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import cors from "cors";
import { json } from "body-parser";

import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { PubSub } from "graphql-subscriptions";

import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";

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

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
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
    ],
  });

  await server.start();

  const corsOptions = {
    origin: process.env.BASE_URL || "http://localhost:3000",
    credentials: true,
  };
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(corsOptions),
    json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<IGraphqlContext> => {
        const session = await getSession({ req });
        return { session: session as ISession, prisma, pubsub };
      },
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log(`http://localhost:4000/graphql`);
}
main().catch((err) => console.log(err));
