import merge from "lodash.merge";
import userResolvers from "./user";
import conversationsResolvers from "./conversation";
import messageResolvers from "./message";
import scalarResolvers from "./scalars";

const resolvers = merge(
  {},
  userResolvers,
  conversationsResolvers,
  messageResolvers,
  scalarResolvers
);

export default resolvers;
