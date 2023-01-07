import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";

import { makeExecutableSchema } from "@graphql-tools/schema";

import typeDefs from "./graphql/types";
import resolvers from "./graphql/resolvers";

import express from "express";
import http from "http";
import { ApolloServer } from "apollo-server-express";

async function main() {
  const app = express();
  const httpServer = http.createServer(app);
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: "bounded",
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });

  await server.start();
  server.applyMiddleware({ app });
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  );
  console.log(`http://localhost:4000${server.graphqlPath}`);
}
main().catch((err) => console.log(err));
