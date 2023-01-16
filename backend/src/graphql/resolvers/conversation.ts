import { Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
import {
  ConversationPopulated,
  IConversationDeletedSubscriptionPayload,
  IConversationUpdatedSubscriptionPayload,
  IGraphqlContext,
} from "../../types";
import { userIsConversationParticipant } from "../../util";

const resolvers = {
  Query: {
    conversations: async (
      _: any,
      __: any,
      context: IGraphqlContext
    ): Promise<Array<ConversationPopulated>> => {
      const { session, prisma } = context;

      if (!session?.user) {
        throw new GraphQLError("Not Authorized");
      }

      const {
        user: { id: userId },
      } = session;

      try {
        const conversations = await prisma.conversation.findMany({
          /*
          where: {
            participants: {
              some: {
                userId: {
                  equals: userId,
                },
              },
            },
          },
          */
          include: conversationPopulated,
        });

        /*----------- Since there is bug in above code --------------*/
        return conversations.filter(
          (conversation) =>
            !!conversation.participants.find((p) => p.userId === userId)
        );
      } catch (error: any) {
        console.log("Conversation error", error);
        throw new GraphQLError(error?.message);
      }
    },
  },
  Mutation: {
    createConversation: async (
      _: any,
      args: { participantIds: Array<string> },
      context: IGraphqlContext
    ): Promise<{ conversationId: string }> => {
      const { session, prisma, pubsub } = context;
      const { participantIds } = args;

      if (!session?.user) {
        throw new GraphQLError("Not Authorized");
      }

      const {
        user: { id: userid },
      } = session;

      try {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: participantIds.map((id) => ({
                  userId: id,
                  hasSeenLatestMessage: id === userid,
                })),
              },
            },
          },
          include: conversationPopulated,
        });

        // EMIT CONVERSATION CREATED EVENT USING PUBSUB
        pubsub.publish("CONVERSATION_CREATED", {
          conversationCreated: conversation,
        });
        return {
          conversationId: conversation.id,
        };
      } catch (error) {
        console.log("Create conversation error ", error);
        throw new GraphQLError("Error while creating conversation");
      }
    },

    markConversationAsRead: async function (
      _: any,
      args: { userId: string; conversationId: string },
      context: IGraphqlContext
    ): Promise<boolean> {
      const { session, prisma } = context;
      const { userId, conversationId } = args;

      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }

      try {
        const participant = await prisma.conversationParticipant.findFirst({
          where: {
            userId,
            conversationId,
          },
        });

        // Should always exists but being safe
        if (!participant) {
          throw new GraphQLError("Participant entity not found");
        }

        await prisma.conversationParticipant.update({
          where: {
            id: participant.id,
          },
          data: {
            hasSeenLatestMessage: true,
          },
        });

        return true;
      } catch (error: any) {
        console.log("markConversationAsRead error", error);
        throw new GraphQLError(error?.message);
      }
    },

    deleteConversation: async function (
      _: any,
      args: { conversationId: string },
      context: IGraphqlContext
    ): Promise<boolean> {
      const { session, prisma, pubsub } = context;
      const { conversationId } = args;

      if (!session?.user) {
        throw new GraphQLError("Not authorized");
      }

      try {
        /*---------- Delete conversation and all related entities ----------*/
        const [deletedConversation] = await prisma.$transaction([
          prisma.conversation.delete({
            where: {
              id: conversationId,
            },
            include: conversationPopulated,
          }),
          prisma.conversationParticipant.deleteMany({
            where: {
              conversationId,
            },
          }),
          prisma.message.deleteMany({
            where: {
              conversationId,
            },
          }),
        ]);

        pubsub.publish("CONVERSATION_DELETED", {
          conversationDeleted: deletedConversation,
        });
      } catch (error: any) {
        console.log("deleteConversation error", error);
        throw new GraphQLError("Failed to delete conversation");
      }

      return true;
    },
  },
  Subscription: {
    conversationCreated: {
      subscribe: withFilter(
        (_: any, __: any, context: IGraphqlContext) => {
          const { pubsub } = context;

          return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
        },
        (
          payload: IConversationCreatedSubscriptionPayload,
          _,
          context: IGraphqlContext
        ) => {
          const { session } = context;

          if (!session?.user) {
            throw new GraphQLError("Not authorized");
          }

          const {
            conversationCreated: { participants },
          } = payload;

          const userIsParticipant = userIsConversationParticipant(
            participants,
            session.user.id
          );

          return userIsParticipant;
        }
      ),
    },

    conversationUpdated: {
      subscribe: withFilter(
        (_: any, __: any, context: IGraphqlContext) => {
          const { pubsub } = context;

          return pubsub.asyncIterator(["CONVERSATION_UPDATED"]);
        },
        (
          payload: IConversationUpdatedSubscriptionPayload,
          _: any,
          context: IGraphqlContext
        ) => {
          const { session } = context;

          if (!session?.user) {
            throw new GraphQLError("Not authorized");
          }

          const { id: userId } = session.user;
          const {
            conversationUpdated: {
              conversation: { participants },
            },
          } = payload;

          return userIsConversationParticipant(participants, userId);
        }
      ),
    },

    conversationDeleted: {
      subscribe: withFilter(
        (_: any, __: any, context: IGraphqlContext) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(["CONVERSATION_DELETED"]);
        },
        (
          payload: IConversationDeletedSubscriptionPayload,
          _: any,
          context: IGraphqlContext
        ) => {
          const { session } = context;
          if (!session?.user) {
            throw new GraphQLError("Not authorized");
          }

          const { id: userId } = session.user;
          const { participants } = payload.conversationDeleted;
          return userIsConversationParticipant(participants, userId);
        }
      ),
    },
  },
};

export interface IConversationCreatedSubscriptionPayload {
  conversationCreated: ConversationPopulated;
}

export const participantPopulated =
  Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
      select: {
        id: true,
        username: true,
      },
    },
  });
export const conversationPopulated =
  Prisma.validator<Prisma.ConversationInclude>()({
    participants: {
      include: participantPopulated,
    },
    latestMessage: {
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
  });

export default resolvers;
