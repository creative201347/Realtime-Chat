import { useLazyQuery } from "@apollo/client";
import {
  Button,
  filter,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

import UserOperations from "../../../../graphql/operations/user";
import {
  ISearchedUsers,
  ISearchUsersData,
  ISearchUsersInput,
} from "../../../../types";
import Participants from "./Participants";
import UserSearchList from "./UserSearchList";

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConversationModal: React.FC<ConversationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [username, setUsername] = useState("");
  const [participants, setParticipants] = useState<Array<ISearchedUsers>>([]);

  const [searchUsers, { data, error, loading }] = useLazyQuery<
    ISearchUsersData,
    ISearchUsersInput
  >(UserOperations.Queries.searchUsers);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    searchUsers({ variables: { username } });
    setUsername("");
  };

  const addParticipants = (user: ISearchedUsers) => {
    if (participants.includes(user)) return;
    setParticipants((prev) => [...prev, user]);
  };
  const removeParticipants = (userId: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== userId));
  };

  const onCreateConversation = async () => {
    try {
      // Create Conversation Mutation
    } catch (error: any) {
      console.log("Create Conversation Error", error);
      toast.error(error?.messase);
    }
  };
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="#2d2d2d" pb={4}>
          <ModalHeader>Create a Conversation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={onSubmit}>
              <Stack spacing={4}>
                <Input
                  placeholder="Enter a username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
                <Button type="submit" disabled={!username} isLoading={loading}>
                  Search
                </Button>
              </Stack>
            </form>

            {data?.searchUsers && (
              <UserSearchList
                users={data.searchUsers}
                addParticipants={addParticipants}
              />
            )}

            {participants.length !== 0 && (
              <>
                <Participants
                  participants={participants}
                  removeParticipants={removeParticipants}
                />
                <Button
                  bg="brand.100"
                  width="100%"
                  mt={6}
                  _hover={{ bg: "brand.100" }}
                  onClick={() => {}}
                >
                  Start Conversation
                </Button>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
export default ConversationModal;
