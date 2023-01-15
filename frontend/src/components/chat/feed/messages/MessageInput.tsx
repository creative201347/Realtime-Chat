import { Box, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

interface MessageInputProps {
  session: Session;
  conversationId: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  session,
  conversationId,
}) => {
  const [messageBody, setMessageBody] = useState("");

  const onSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      // Call sendMessage Mutation
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
