import { useQuery } from "@apollo/client";
import { Flex, Stack } from "@chakra-ui/react";
import { toast } from "react-hot-toast";

import MessagesOperation from "../../../../graphql/operations/message";
import { IMessagesData, IMessagesVariables } from "../../../../types";

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

  console.log("MESSAGES DATA", data);
  return (
    <Flex direction="column" justify="flex-end" overflow="hidden">
      {loading && (
        <Stack>
          {/* <SkeletonLoader count={4} height="60px" width="100%" /> */}
          <span>LOADING MESSAGES...</span>
        </Stack>
      )}
      {data?.messages && (
        <Flex direction="column-reverse" height="100%">
          {data.messages.map((message) => (
            // <MessageItem />
            <div key={message.id}>{message.body}</div>
          ))}
        </Flex>
      )}
    </Flex>
  );
};
export default Messages;
