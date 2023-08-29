interface User {
  id: number;
  createdAt: string;
  updatedAt: string;
  username: string;
  gamesWon: number;
  gameLost: number;
  avatar?: string;
  email: string;
  friends: Friendship[];
  friendOf: Friendship[];
  ownedChatRooms: ChatRoom[];
  memberChatRooms: ChatRoom[];
  moderatorChatRooms: ChatRoom[];
  bannedChatRooms: ChatRoom[];
  matchHistoryWinner: Match[];
  matchHistoryLoser: Match[];
}

interface Friendship {
  id: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  userId: number;
  friend: User;
  friendId: number;
}

interface ChatRoom {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  hash?: string;
  invite: boolean;
  owner: User;
  ownerId: number;
  members: User[];
  moderators: User[];
  bannedUsers: User[];
}

interface Match {
  id: number;
  createdAt: string;
  updatedAt: string;
  winner: User;
  winnerId: number;
  loser: User;
  loserId: number;
}

export type { User, Friendship, ChatRoom, Match };