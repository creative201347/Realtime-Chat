import { useQuery } from "@apollo/client";
import { Flex, Stack } from "@chakra-ui/react";
import { useEffect } from "react";

import { toast } from "react-hot-toast";

import MessagesOperation from "../../../../graphql/operations/message";
import {
  IMessagesData,
  IMessagesVariables,
  IMessageSubscriptionData,
} from "../../../../types";
import SkeletonLoader from "../../../common/SkeletonLoader";
import MessageItem from "./MessageItem";

interface MessagesProps {
  userId: string;
  conversationId: string;
}

const Messages: React.FC<MessagesProps> = ({ userId, conversationId }) => {
  const { data, loading, error, subscribeToMore } = useQuery<
    IMessagesData,
    IMessagesVariables
  >(MessagesOperation.Query.messages, {
    variables: {
      conversationId,
    },
    onError: ({ message }) => {
      toast.error(message);
    },
  });

  const subscribeToMoreMessages = (conversationId: string) => {
    subscribeToMore({
      document: MessagesOperation.Subscription.messageSent,
      variables: { conversationId },
      updateQuery: (prev, { subscriptionData }: IMessageSubscriptionData) => {
        if (!subscriptionData) return prev;

        const newMessage = subscriptionData.data.messageSent;

        return Object.assign({}, prev, {
          messages:
            newMessage.sender.id === userId
              ? prev.messages
              : [newMessage, ...prev.messages],
        });
      },
    });
  };

  useEffect(() => {
    subscribeToMoreMessages(conversationId);
  }, [conversationId]);
  if (error) return null;

  return (
    <Flex direction="column" justify="flex-end" overflow="hidden">
      {error && (
        <Stack spacing={4} px={4}>
          <SkeletonLoader count={4} height="60px" width="100%" />
          <span>LOADING MESSAGES...</span>
        </Stack>
      )}
      {data?.messages && (
        <Flex direction="column-reverse" height="100%" overflowY="scroll">
          {data.messages.map((message) => (
            <MessageItem
              message={message}
              sentByMe={message.sender.id === userId}
              key={message.id}
            />
          ))}
        </Flex>
      )}
    </Flex>
  );
};
export default Messages;
