import { Flex } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import MessagesHeader from "./messages/MessageHeader";
import MessageInput from "./messages/MessageInput";
import Messages from "./messages/Messages";

interface FeedWrapperProps {
  session: Session;
}

const FeedWrapper: React.FC<FeedWrapperProps> = ({ session }) => {
  const router = useRouter();
  const { conversationId } = router.query;
  const { id: userId } = session.user;

  return (
    <Flex
      display={{ base: conversationId ? "flex" : "none", md: "flex" }}
      direction="column"
      width="100%"
    >
      {conversationId && typeof conversationId === "string" ? (
        <>
          <Flex
            direction="column"
            justify="space-between"
            overflow="hidden"
            flexGrow={1}
          >
            <MessagesHeader conversationId={conversationId} userId={userId} />
            <Messages conversationId={conversationId} userId={userId} />
          </Flex>
          <MessageInput session={session} conversationId={conversationId} />
        </>
      ) : (
        <div>No Conversation Yet</div>
      )}
    </Flex>
  );
};
export default FeedWrapper;
