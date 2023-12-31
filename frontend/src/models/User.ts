interface User {
  jwtToken: string;
  id: number;
  createdAt: string;
  updatedAt: string;
  username: string;
  avatar?: string;
  email: string;
  is2FA: boolean;
  is2FAValidated: boolean;
  tkn :string| null;
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

interface Matches {
  matchesWon: Array<{ date: string; winner: string; loser: string }>;
  matchesLost: Array<{ date: string; winner: string; loser: string }>;
}

export type { User, Friendship, ChatRoom, Match, Matches };
