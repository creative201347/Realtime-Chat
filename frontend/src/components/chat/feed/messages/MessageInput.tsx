import { useMutation } from "@apollo/client";
import { Box, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { ObjectID } from "bson";

import { ISendMessageArguments } from "../../../../../../backend/src/types";
import MessageOperations from "../../../../graphql/operations/message";
import { IMessagesData } from "../../../../types";

interface MessageInputProps {
  session: Session;
  conversationId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  session,
  conversationId,
}) => {
  const [messageBody, setMessageBody] = useState("");
  const [sendMessage] = useMutation<
    { sendMessage: boolean },
    ISendMessageArguments
  >(MessageOperations.Mutation.sendMessage);

  const onSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      // Call sendMessage Mutation
      const { id: senderId } = session.user;
      const messageId = new ObjectID().toString();
      const newMessage: ISendMessageArguments = {
        id: messageId,
        senderId,
        conversationId,
        body: messageBody,
      };
      setMessageBody("");

      const { data, errors } = await sendMessage({
        variables: {
          ...newMessage,
        },

        //  Optimistically update UI
        optimisticResponse: {
          sendMessage: true,
        },
        update: (cache) => {
          setMessageBody("");
          const existing = cache.readQuery<IMessagesData>({
            query: MessageOperations.Query.messages,
            variables: { conversationId },
          }) as IMessagesData;

          cache.writeQuery<IMessagesData, { conversationId: string }>({
            query: MessageOperations.Query.messages,
            variables: { conversationId },
            data: {
              ...existing,
              messages: [
                {
                  id: messageId,
                  body: messageBody,
                  senderId: session.user.id,
                  conversationId,
                  sender: {
                    id: session.user.id,
                    username: session.user.username,
                  },
                  createdAt: new Date(Date.now()),
                  updatedAt: new Date(Date.now()),
                },
                ...existing.messages,
              ],
            },
          });
        },
      });

      if (!data?.sendMessage || errors) {
        throw new Error("failed to send message");
      }
    } catch (error: any) {
      console.log("On send message error", error);
      toast.error(error?.message);
    }
  };
  return (
    <Box px={4} py={6} width="100%">
      <form onSubmit={onSendMessage}>
        <Input
          value={messageBody}
          onChange={(event) => setMessageBody(event.target.value)}
          size="md"
          placeholder="New message"
          color="whiteAlpha.900"
          resize="none"
          _focus={{
            boxShadow: "none",
            border: "1px solid",
            borderColor: "whiteAlpha.300",
          }}
          _hover={{
            borderColor: "whiteAlpha.300",
          }}
        />
      </form>
    </Box>
  );
};
export default MessageInput;
