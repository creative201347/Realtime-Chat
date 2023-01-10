import { useMutation } from "@apollo/client";
import { Button, Center, Image, Input, Stack, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";

import UserOperations from "../../graphql/operations/user";
import { ICreateUsernameData, ICreateUsernameVariables } from "../../types";

interface IAuthProps {
  session: Session | null;
  reloadSession: () => void;
}

const Auth: React.FC<IAuthProps> = ({ session, reloadSession }) => {
  const [username, setUsername] = useState("");

  const [createUsername, { loading, error }] = useMutation<
    ICreateUsernameData,
    ICreateUsernameVariables
  >(UserOperations.Mutations.createUsername);

  const onSubmit = async () => {
    if (!username) return;
    try {
      // Create username mutation to send our username to the Graphql API
      const { data } = await createUsername({ variables: { username } });

      if (!data?.createUsername) {
        throw new Error();
      }

      if (data.createUsername.error) {
        const {
          createUsername: { error },
        } = data;
        throw new Error(error);
      }

      toast.success("Successfully added username!!");
      reloadSession();
    } catch (error: any) {
      toast.error(error?.message);
      console.log(error);
    }
  };
  return (
    <Center height="100vh">
      <Stack align="center" spacing={2}>
        {session ? (
          <>
            <Text fontSize="3xl">Create a username</Text>
            <Input
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <Button
              width="100%"
              background="blue.500"
              onClick={onSubmit}
              isLoading={loading}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <Text fontSize="2xl" textColor="pink.500">
              Creative Nepal
            </Text>
            <Button
              onClick={() => signIn("google")}
              leftIcon={
                <Image src="/images/googlelogo.png" height="20px"></Image>
              }
            >
              Continue with Google
            </Button>
          </>
        )}
      </Stack>
    </Center>
  );
};

export default Auth;
