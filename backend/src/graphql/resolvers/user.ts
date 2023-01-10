import { ICreateUsernameResponse, IGraphqlContext } from "../../types";

const resolvers = {
  Query: {
    searchUsers: () => {},
  },
  Mutation: {
    createUsername: async (
      _: any,
      args: { username: string },
      context: IGraphqlContext
    ): Promise<ICreateUsernameResponse> => {
      const { username } = args;
      const { session, prisma } = context;

      if (!session?.user) {
        return {
          error: "Not Authorized",
        };
      }

      const { id: userId } = session.user;
      try {
        const existingUser = await prisma.user.findUnique({
          where: { username },
        });
        if (existingUser) {
          return {
            error: "Username already taken, try another",
          };
        }

        await prisma.user.update({
          where: { id: userId },
          data: { username },
        });

        return { success: true };
      } catch (error: any) {
        console.log("Create username error", error);
        return {
          error: error?.message,
        };
      }
    },
  },
  // Subscription: {},
};

export default resolvers;
