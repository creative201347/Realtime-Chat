import merge from "lodash.merge";
import userResolvers from "./user";
import conversationsResolvers from "./conversation";

const resolvers = merge({}, userResolvers, conversationsResolvers);

export default resolvers;
