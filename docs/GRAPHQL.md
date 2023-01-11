
## SERVER

```ts
/* ------TypeDefs BoilerPlate------ */
import { gql } from "apollo-server-core";

const typeDefs = gql`
  type Mutation {
    createConversation(participantsIds: [String]): CreateConversationResponse
  }

  type CreateConversationResponse {
    conversationId: String
  }
`;
export default typeDefs;
```

```ts
import userTypeDefs from "./user";
import conversationTypeDefs from "./conversation";

const typeDefs = [userTypeDefs, conversationTypeDefs];
export default typeDefs;
```


```ts
/* ------Resolvers BoilerPlate------ */
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
```

```ts
import merge from "lodash.merge";
import userResolvers from "./user";
import conversationsResolvers from "./conversation";

const resolvers = merge({}, userResolvers, conversationsResolvers);

export default resolvers;
```


## CLIENT
```ts
import { gql } from "@apollo/client";

export default {
  Queries: {},
  Mutations: {
    createConversation: gql`
      mutation CreateConversation($participantsIds: [String]!) {
        createConversation(participantsIds: $participantsIds) {
          conversationId
        }
      }
    `,
  },
  Subscriptions: {},
};
```

```ts
interface ICreateConversationData {
  createConversation: {
    conversationId: string;
  };
}
interface ICreateConversationInput {
  participantsIds: Array<string>;
}

const [createConversation, { loading: createConversationLoading }] =
  useMutation<ICreateConversationData, ICreateConversationInput>(
    ConversationOperations.Mutations.createConversation
);

const onCreateConversation = async () => {
  const participantsIds = [userId, ...participants.map((p) => p.id)];
  try {
    const { data } = await createConversation({
      variables: { participantsIds },
    });
  } catch (error: any) {
  }
};
```