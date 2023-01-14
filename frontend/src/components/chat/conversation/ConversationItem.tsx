import { Stack, Text } from "@chakra-ui/react";
import { ConversationPopulated } from "../../../../../backend/src/types";

interface ConversationItemProps {
  conversation: ConversationPopulated;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
}) => {
  return (
    <Stack p={4} _hover={{ bg: "whiteAlpha.200" }} border="1px solid red">
      <Text>{conversation.id}</Text>
    </Stack>
  );
};
export default ConversationItem;
