import { gql } from "graphql-tag";

const typeDefs = gql`
  type User {
    id: String
    name: String
    username: String
    email: String
    emailVerified: String
    image: String
  }

  type SearchedUser {
    id: String
    username: String
  }

  type Query {
    searchUsers(username: String): [SearchedUser]
  }

  type Mutation {
    createUsername(username: String): CreateUserNameResponse
  }

  type CreateUserNameResponse {
    success: Boolean
    error: String
  }
`;

export default typeDefs;
