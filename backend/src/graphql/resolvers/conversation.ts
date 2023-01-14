import { Prisma } from "@prisma/client";
import { ApolloError } from "apollo-server-core";
import { IGraphqlContext } from "../../types";

const resolvers = {
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

export const participantPopulates =
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
      include: participantPopulates,
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
