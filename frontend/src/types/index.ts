export interface ICreateUsernameData {
  createUsername: {
    success: boolean;
    error: string;
  };
}

export interface ICreateUsernameVariables {
  username: string;
}

/*----------- Searching users ------------*/
export interface ISearchUsersInput {
  username: string;
}
export interface ISearchUsersData {
  searchUsers: Array<ISearchedUsers>;
}
export interface ISearchedUsers {
  id: string;
  username: string;
}
