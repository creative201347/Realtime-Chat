import { Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
import {
  IGraphqlContext,
  ISendMessageArguments,
  ISendMessageSentSubscriptionPayload,
  MessagePopulated,
} from "../../types";
import { userIsConversationParticipant } from "../../util";
import { conversationPopulated } from "./conversation";

const resolvers = {
  Query: {
    messages: async function (
      _: any,
      args: { conversationId: string },
      context: IGraphqlContext
    ): Promise<Array<MessagePopulated>> {
      const { session, prisma } = context;
      const { conversationId } = args;

      if (!session?.user) {
        throw new GraphQLError("Not Authorized");
      }
      const { id: userId } = session.user;

      // Verify that the Conversation exists &&  user is a Participant
      const conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: conversationPopulated,
      });

      if (!conversation) {
        throw new GraphQLError("Conversation Not Found");
      }

      const allowedToView = userIsConversationParticipant(
        conversation.participants,
        userId
      );

      if (!allowedToView) {
        throw new GraphQLError("Not Authorized");
      }

      try {
        const messages = await prisma.message.findMany({
          where: {
            conversationId,
          },
          include: messagePopulated,
          orderBy: {
            createdAt: "desc",
          },
        });

        // return messages;
        return [{ body: "MESSAGE OKEY!!" } as MessagePopulated];
      } catch (error: any) {
        console.log("Messages Error");
        throw new GraphQLError(error.message);
      }
    },
  },
  Mutation: {
    sendMessage: async function (
      _: any,
      args: ISendMessageArguments,
      context: IGraphqlContext
    ): Promise<boolean> {
      const { session, prisma, pubsub } = context;
      const { id: messageId, senderId, conversationId, body } = args;

      if (!session?.user) {
        throw new GraphQLError("Not Authorized");
      }
      const { id: userId } = session.user;

      if (userId !== senderId) {
        throw new GraphQLError("Not Authorized");
      }

      try {
        // Create new Message Entity
        const newMessage = await prisma.message.create({
          data: {
            id: messageId,
            senderId,
            conversationId,
            body,
          },
          include: messagePopulated,
        });

        // Update conversation Update
        const conversation = await prisma.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            latestMessageId: newMessage.id,
            participants: {
              update: {
                where: {
                  id: senderId,
                },
                data: {
                  hasSeenLatestMessage: true,
                },
              },
              updateMany: {
                where: {
                  NOT: {
                    userId: senderId,
                  },
                },
                data: {
                  hasSeenLatestMessage: false,
                },
              },
            },
          },
        });

        pubsub.publish("MESSAGE_SENT", { messageSent: newMessage });
        // pubsub.publish("CONERSATION_UPDATED", {
        //   conversationUpdated: { conversation },
        // });
      } catch (error) {
        console.log("SEND MESSAGE ERROR");
        throw new GraphQLError("Error sending message");
      }
      return true;
    },
  },
  Subscription: {
    messageSent: {
      subscribe: withFilter(
        (_: any, __: any, context: IGraphqlContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["MESSAGE_SENT"]);
        },
        (
          payload: ISendMessageSentSubscriptionPayload,
          args: { conversationId: string },
          context: IGraphqlContext
        ) => {
          return payload.messageSent.conversationId === args.conversationId;
        }
      ),
    },
  },
};

export const messagePopulated = Prisma.validator<Prisma.MessageInclude>()({
  sender: {
    select: {
      id: true,
      username: true,
    },
  },
});
export default resolvers;
