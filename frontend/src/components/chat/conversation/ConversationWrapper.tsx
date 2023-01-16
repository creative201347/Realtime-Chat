import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";

import ConversationList from "./ConversationList";
import ConversationOperations from "../../../graphql/operations/conversation";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import {
  IConversationDeletedData,
  IConversationsData,
  IConversationUpdatedData,
} from "../../../types";
import { useEffect } from "react";
import { useRouter } from "next/router";
import SkeletonLoader from "../../common/SkeletonLoader";
import {
  ConversationPopulated,
  ParticipantPopulated,
} from "../../../../../backend/src/types";

interface ConversationWrapperProps {
  session: Session;
}

const ConversationWrapper: React.FC<ConversationWrapperProps> = ({
  session,
}) => {
  const {
    data: conversationsData,
    error: conversationsError,
    loading: conversationsLoading,
    subscribeToMore,
  } = useQuery<IConversationsData, null>(
    ConversationOperations.Queries.conversations
  );

  const [markConversationAsRead] = useMutation<
    { markConversationAsRead: boolean },
    { userId: string; conversationId: string }
  >(ConversationOperations.Mutations.markConversationAsRead);

  const router = useRouter();
  const { conversationId } = router.query;
  const { id: userId } = session.user;

  const subscribeToNewConversations = () => {
    subscribeToMore({
      document: ConversationOperations.Subscriptions.conversationCreated,
      updateQuery: (
        prev,
        {
          subscriptionData,
        }: {
          subscriptionData: {
            data: { conversationCreated: ConversationPopulated };
          };
        }
      ) => {
        if (!subscriptionData.data) return prev;

        const newConversation = subscriptionData.data.conversationCreated;

        return Object.assign({}, prev, {
          conversations: [newConversation, ...prev.conversations],
        });
      },
    });
  };

  /* ---------- Execute subscription on mount ---------- */
  useEffect(() => {
    subscribeToNewConversations();
  }, []);

  useSubscription<IConversationUpdatedData, null>(
    ConversationOperations.Subscriptions.conversationUpdated,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;

        if (!subscriptionData) return;

        const {
          conversationUpdated: { conversation: updatedConversation },
        } = subscriptionData;

        const currentlyViewingConversation =
          updatedConversation.id === conversationId;

        if (currentlyViewingConversation) {
          onViewConversation(conversationId as string, false);
        }
      },
    }
  );
  useSubscription<IConversationDeletedData, null>(
    ConversationOperations.Subscriptions.conversationDeleted,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;
        if (!subscriptionData) return;

        const existing = client.readQuery<IConversationsData>({
          query: ConversationOperations.Queries.conversations,
        });
        if (!existing) return;

        const { conversations } = existing;
        const { id: deletedConversationId } =
          subscriptionData.conversationDeleted;

        client.writeQuery<IConversationsData>({
          query: ConversationOperations.Queries.conversations,
          data: {
            conversations: conversations.filter(
              (conversation) => conversation.id !== deletedConversationId
            ),
          },
        });

        router.push("/");
      },
    }
  );

  const onViewConversation = async (
    conversationId: string,
    hasSeenLatestMessage: boolean | undefined
  ) => {
    // 1. Push the conversationId to the router query params
    router.push({ query: { conversationId } });

    // 2. Mark the conversation as read
    if (hasSeenLatestMessage) return;

    // markConversationAsRead mutation
    try {
      await markConversationAsRead({
        variables: {
          userId,
          conversationId,
        },
        optimisticResponse: {
          markConversationAsRead: true,
        },
        update: (cache) => {
          // Get conversation participants from cache
          const participantsFragment = cache.readFragment<{
            participants: Array<ParticipantPopulated>;
          }>({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment Participants on Conversation {
                participants {
                  user {
                    id
                    username
                  }
                  hasSeenLatestMessage
                }
              }
            `,
          });

          if (!participantsFragment) return;

          const participants = [...participantsFragment.participants];

          const userParticipantIdx = participants.findIndex(
            (p) => p.user.id === userId
          );

          if (userParticipantIdx === -1) return;

          const userParticipant = participants[userParticipantIdx];

          // Update participant to show latest message as read
          participants[userParticipantIdx] = {
            ...userParticipant,
            hasSeenLatestMessage: true,
          };

          // Update cache
          cache.writeFragment({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment UpdatedParticipant on Conversation {
                participants
              }
            `,
            data: {
              participants,
            },
          });
        },
      });
    } catch (error) {
      console.log("onViewConversation error", error);
    }
  };

  return (
    <Box
      display={{ base: conversationId ? "none" : "flex", md: "flex" }}
      width={{ base: "100%", md: "400px" }}
      flexDirection="column"
      gap={4}
      bg="whiteAlpha.50"
      py={6}
      px={3}
    >
      {conversationsLoading ? (
        <SkeletonLoader count={7} height="80px" width="100%" />
      ) : (
        <ConversationList
          session={session}
          conversations={conversationsData?.conversations || []}
          onViewConversation={onViewConversation}
        />
      )}
    </Box>
  );
};
export default ConversationWrapper;
