import merge from "lodash.merge";
import userResolvers from "./user";
import conversationsResolvers from "./conversation";
import messageResolvers from "./message";

const resolvers = merge(
  {},
  userResolvers,
  conversationsResolvers,
  messageResolvers
);

export default resolvers;
