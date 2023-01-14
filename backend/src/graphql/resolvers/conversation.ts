import { Prisma } from "@prisma/client";
import { ApolloError } from "apollo-server-core";
import { ConversationPopulated, IGraphqlContext } from "../../types";

const resolvers = {
  Query: {
    conversations: async (
      _: any,
      __: any,
      context: IGraphqlContext
    ): Promise<Array<ConversationPopulated>> => {
      const { session, prisma } = context;

      if (!session?.user) {
        throw new ApolloError("Not Authorized");
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
        throw new ApolloError(error?.message);
      }
    },
  },
  Mutation: {
    createConversation: async (
      _: any,
      args: { participantsIds: Array<string> },
      context: IGraphqlContext
    ): Promise<{ conversationId: string }> => {
      const { session, prisma } = context;
      const { participantsIds } = args;

      if (!session?.user) {
        throw new ApolloError("Not Authorized");
      }

      const {
        user: { id: userid },
      } = session;

      try {
        const conversation = await prisma.conversation.create({
          data: {
            participants: {
              createMany: {
                data: participantsIds.map((id) => ({
                  userId: id,
                  hasSeenLatestMessage: id === userid,
                })),
              },
            },
          },
          include: conversationPopulated,
        });

        // EMIT CONVERSATION CREATED EVENT USING PUBSUB

        return {
          conversationId: conversation.id,
        };
      } catch (error) {
        console.log("Create conversation error ", error);
        throw new ApolloError("Error while creating conversation");
      }
    },
  },
};

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
