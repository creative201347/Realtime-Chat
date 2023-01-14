import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";

import ConversationList from "./ConversationList";
import ConversationOperations from "../../../graphql/operations/conversation";
import { useQuery } from "@apollo/client";
import { IConversationsData } from "../../../types";
import { ConversationPopulated } from "../../../../../backend/src/types";
import { useEffect } from "react";

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

  console.log("QUERY DATA", conversationData);

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
    <Box width={{ base: "100%", md: "400px" }} bg="whiteAlpha.50" py={6} px={3}>
      {/* Skeleton Loader  */}
      <ConversationList
        session={session}
        conversations={conversationData?.conversations || []}
      />
    </Box>
  );
};
export default ConversationWrapper;
