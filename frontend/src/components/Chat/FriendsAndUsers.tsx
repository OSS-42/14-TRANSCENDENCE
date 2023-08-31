import { useState } from "react";
import { User } from "../../models/User";
import ChatBar from "./ChatBar";
import ChatFriends from "./ChatFriends";


export function FriendsAndUsers({ socket}) {
    const [usersList, setUsersList] = useState<User[]>([]);
    const [friendsList, setFriendsList] = useState<User[]>([]);
    const [connectedUsers, setConnectedUsers] = useState<number[]>([]);
  
    return (
      <>
        <ChatBar socket={socket}  />
        <ChatFriends socket={socket}  />
      </>
    );
  }