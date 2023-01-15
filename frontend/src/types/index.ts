import {
  ConversationPopulated,
  MessagePopulated,
} from "../../../backend/src/types";

export interface ICreateUsernameData {
  createUsername: {
    success: boolean;
    error: string;
  };
}

export interface ICreateUsernameVariables {
  username: string;
}

/*----------- Searching users ------------*/
export interface ISearchUsersInput {
  username: string;
}
export interface ISearchUsersData {
  searchUsers: Array<ISearchedUsers>;
}
export interface ISearchedUsers {
  id: string;
  username: string;
}

/*----------- Create Conversation ------------*/
export interface ICreateConversationData {
  createConversation: {
    conversationId: string;
  };
}
export interface ICreateConversationInput {
  participantsIds: Array<string>;
}

/*----------- Conversations ------------*/
export interface IConversationsData {
  conversations: Array<ConversationPopulated>;
}

/*----------- Messages ------------*/
export interface IMessagesData {
  messages: Array<MessagePopulated>;
}
export interface IMessagesVariables {
  conversationId: string;
}

/*----------- Message Subscription ------------*/
export interface IMessageSubscriptionData {
  subscriptionData: {
    data: {
      messageSent: MessagePopulated;
    };
  };
}
