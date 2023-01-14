import { Flex } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";

interface FeedWrapperProps {
  session: Session;
}

const FeedWrapper: React.FC<FeedWrapperProps> = ({ session }) => {
  const router = useRouter();
  const { conversationId } = router.query;

  return (
    <Flex
      width="100%"
      flexDirection="column"
      display={{ base: conversationId ? "flex" : "none", md: "flex" }}
    >
      {conversationId ? (
        <Flex>{conversationId}</Flex>
      ) : (
        <div>No Conversation Yet</div>
      )}
    </Flex>
  );
};
export default FeedWrapper;
