import { Session } from "next-auth";

interface ConversationWrapperProps {
  session: Session;
}

const ConversationWrapper: React.FC<ConversationWrapperProps> = ({
  session,
}) => {
  return <div>Conversation Wrapper</div>;
};
export default ConversationWrapper;
