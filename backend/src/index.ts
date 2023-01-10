import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";

import { makeExecutableSchema } from "@graphql-tools/schema";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";

import express from "express";
import http from "http";
import { ApolloServer } from "apollo-server-express";
import { IGraphqlContext, ISession } from "./types";

async function main() {
  const app = express();
  dotenv.config();
  const httpServer = http.createServer(app);
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });
  const corsOptions = {
    origin: process.env.BASE_URL || "http://localhost:3000",
    credentials: true,
  };
  /* Context Parameters */
  const prisma = new PrismaClient();

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: "bounded",
    context: async ({ req, res }): Promise<IGraphqlContext> => {
      const session = (await getSession({ req })) as ISession;
      return { session, prisma };
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
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
