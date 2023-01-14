import { Flex } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import MessagesHeader from "./messages/MessageHeader";

interface FeedWrapperProps {
  session: Session;
}

const FeedWrapper: React.FC<FeedWrapperProps> = ({ session }) => {
  const router = useRouter();
  const { conversationId } = router.query;
  const { id: userId } = session.user;

  return (
    <Flex
      width="100%"
      flexDirection="column"
      display={{ base: conversationId ? "flex" : "none", md: "flex" }}
      overflow="hidden"
    >
      {conversationId && typeof conversationId === "string" ? (
        <Flex
          direction="column"
          justify="space-between"
          overflow="hidden"
          flexFlow="1"
          border="1pxsolid red"
        >
          <MessagesHeader conversationId={conversationId} userId={userId} />
          {/* <Messages /> */}
        </Flex>
      ) : (
        <div>No Conversation Yet</div>
      )}
    </Flex>
  );
};
export default FeedWrapper;
