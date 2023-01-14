import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";

import ConversationList from "./ConversationList";
import ConversationOperations from "../../../graphql/operations/conversation";
import { useQuery } from "@apollo/client";
import { IConversationsData } from "../../../types";
import { useEffect } from "react";
import { useRouter } from "next/router";

interface ConversationWrapperProps {
  session: Session;
}

const ConversationWrapper: React.FC<ConversationWrapperProps> = ({
  session,
}) => {
  const {
    data: conversationData,
    error: conversationError,
    loading: conversationLoading,
    subscribeToMore,
  } = useQuery<IConversationsData, null>(
    ConversationOperations.Queries.conversations
  );

  const router = useRouter();
  const { conversationId } = router.query;

  const onViewConversation = async (conversationId: string) => {
    // 1. Push the new conversationId to the router query params
    router.push({ query: { conversationId } });
    // 2. Mark the conversation as read
  };

  const subscribeToNewConversations = () => {
    subscribeToMore({
      document: ConversationOperations.Subscriptions.conversationCreated,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        // @ts-ignore
        const newConversation = subscriptionData.data.conversationCreated;

        console.log("SUB DATA", subscriptionData);

        console.log("PREV CONVERSATIONS", prev);

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

  return (
    <Box
      display={{ base: conversationId ? "none" : "flex", md: "flex" }}
      overflow="hidden"
      width={{ base: "100%", md: "400px" }}
      bg="whiteAlpha.50"
      py={6}
      px={3}
    >
      {/* Skeleton Loader  */}
      <ConversationList
        session={session}
        conversations={conversationData?.conversations || []}
        onViewConversation={onViewConversation}
      />
    </Box>
  );
};
export default ConversationWrapper;
