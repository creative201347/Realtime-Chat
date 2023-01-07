import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prismadb";

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
});

/*
  GoogleProvider({
    clientId:
      process.env.GOOGLE_CLIENT_ID ||
      "864613165712-2atk6i0hiq4osah4pkmohkrs8ms790s7.apps.googleusercontent.com",
    clientSecret:
      process.env.GOOGLE_CLIENT_SECRET ||
      "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",
  }),
*/
