import { Button } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { User } from "../../models/User";

 type someProp = {
  socket: Socket;
};


function ChatBar({ socket }: someProp) {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userFriends, setUserFriends] = useState<string[]>([]);

  async function fetchUserFriends() {
    const jwt_token = Cookies.get("jwt_token");
    try {
      const response = await axios.get("http://localhost:3001/users/me", {
        headers: {
          Authorization: "Bearer " + jwt_token,
        },
      });
      setUserFriends(response.data.friends.map((friend: User) => friend.username));
    } catch (error) {
      console.error("Error fetching user friends:", error);
    }
  }
  useEffect(() => {
    
    async function fetchUsersData() {
      const jwt_token = Cookies.get("jwt_token");
      try {
        const response = await axios.get("http://localhost:3001/users/allUsers", {
          headers: {
            Authorization: "Bearer " + jwt_token,
          },
        });
        setUsersList(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    fetchUsersData();
    fetchUserFriends();
  }, []);

  const addFriend = async (friendUsername: string) => {
    const jwt_token = Cookies.get("jwt_token");
    try {
      await axios.get(`http://localhost:3001/users/addFriend/${friendUsername}`, {
        headers: {
          Authorization: "Bearer " + jwt_token,
        },
      });
      fetchUserFriends();
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  return (
    <div className="chat__sidebar">
      <h2>Open Chat</h2>

      <div>
        <h4 className="chat__header">USERS LIST</h4>
        <div className="chat__users">
          <p></p>
          {usersList.map((user, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                marginBottom: '5px',
              }}
            >
              <img
                src={user.avatar}
                alt={user.username}
                width="50"
                height="50"
                style={{ borderRadius: '50%' }}
              />
              <p>{user.username}</p>
                <Button variant="outlined" size="small" onClick={() => addFriend(user.username)}>Add Friend</Button>
              
            </Box>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatBar;
