import { IGraphqlContext } from "../../types";

const resolvers = {
  Mutation: {
    createConversation: async (
      _: any,
      args: { participantsIds: Array<string> },
      context: IGraphqlContext
    ) => {
      console.log("CREATE CONVERSATION", args);
    },
  },
};

export default resolvers;
