import { Prisma, PrismaClient } from "@prisma/client";
import { ISODateString } from "next-auth";
import {
  conversationPopulated,
  participantPopulated,
} from "../graphql/resolvers/conversation";
import { Context } from "graphql-ws/lib/server";
import { PubSub } from "graphql-subscriptions";

import { messagePopulated } from "../graphql/resolvers/message";

/*----------- Server Configuration ------------*/
export interface IGraphqlContext {
  session: ISession | null;
  prisma: PrismaClient;
  pubsub: PubSub;
}
export interface ISession {
  user: IUser;
  expires: ISODateString;
}
export interface ISubscriptionContext extends Context {
  connectionParams: {
    session?: ISession;
  };
}

/* ------- Users------- */
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

/*----------- Conversations ------------*/
export type ConversationPopulated = Prisma.ConversationGetPayload<{
  include: typeof conversationPopulated;
}>;
export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{
  include: typeof participantPopulated;
}>;

/*----------- Messages ------------*/
export interface ISendMessageArguments {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
}
export interface ISendMessageSentSubscriptionPayload {
  messageSent: MessagePopulated;
}
export type MessagePopulated = Prisma.MessageGetPayload<{
  include: typeof messagePopulated;
}>;
