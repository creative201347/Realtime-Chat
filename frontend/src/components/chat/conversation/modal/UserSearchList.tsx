import { Avatar, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { ISearchedUsers } from "../../../../types";

interface UserSearchListProps {
  users: Array<ISearchedUsers>;
  addParticipants: (user: ISearchedUsers) => void;
}

const UserSearchList: React.FC<UserSearchListProps> = ({
  users,
  addParticipants,
}) => {
  return (
    <>
      {users.length === 0 ? (
        <Flex mt={6} justify="center">
          <Text>No users found</Text>
        </Flex>
      ) : (
        <Stack mt={6}>
          {users.map((user) => (
            <Stack
              key={user.id}
              direction="row"
              align="center"
              spacing={4}
              py={2}
              px={4}
              borderRadius={4}
              _hover={{ bg: "whiteAlpha.200" }}
            >
              <Avatar size="md" />
              <Flex justify="space-between" align="center" width="100%">
                <Text color="whiteAlpha.700" fontWeight="bold">
                  {user.username}
                </Text>
                <Button
                  size="sm"
                  bg="brand.100"
                  _hover={{ bg: "brand.100" }}
                  onClick={() => addParticipants(user)}
                >
                  Message
                </Button>
              </Flex>
            </Stack>
          ))}
        </Stack>
      )}
    </>
  );
};
export default UserSearchList;
