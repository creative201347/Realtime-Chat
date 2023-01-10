import { PrismaClient } from "@prisma/client";
import { ISODateString } from "next-auth";

export interface IGraphqlContext {
  session: ISession | null;
  prisma: PrismaClient;
  // pubsub
}

/* ------- Users------- */
export interface ISession {
  user: IUser;
  expires: ISODateString;
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  image: string;
  name: string;
}
export interface ICreateUsernameResponse {
  success?: boolean;
  error?: string;
}
