import { Button, Center, Image, Input, Stack, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { useState } from "react";

interface IAuthProps {
  session: Session | null;
  reloadSession: () => void;
}

const Auth: React.FC<IAuthProps> = ({ session, reloadSession }) => {
  const [username, setUsername] = useState("");

  const onSubmit = async () => {
    try {
      // Create username mutation to send our username to the Graphql API
    } catch (error) {
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
            <Button width="100%" background="blue.500" onClick={onSubmit}>
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
