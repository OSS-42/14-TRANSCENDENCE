import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import axios from "axios";
import Cookies from "js-cookie";
import { Box } from "@mui/material";
import { User } from "../../models/User";


////ON VA DEVOIR PEUT ETRE UTILISER REDUX AFIN DAVOIR DES STATES GLOBALES


type ChatFooterProps = {
  socket: Socket; // Assurez-vous que ce type correspond au type de socket que vous utilisez
};



const ChatFriends = ({ socket }: ChatFooterProps) => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<number[]>([]);
  

    useEffect(() => {
      async function fetchUsersData() {
        socket.on('updateConnectedUsers', (updatedUsers: number[]) => {
          setConnectedUsers(updatedUsers);
          console.log("updateduser ::" + updatedUsers)
        });
        
        const jwt_token = Cookies.get('jwt_token');
        try {
          const response = await axios.get('http://localhost:3001/users/friendsList', {
            headers: {
              Authorization: "Bearer " + jwt_token,
            },
          });
          // setUsersList(response.data)
          setUsersList(response.data)
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
  
      fetchUsersData();
    }, []);
  
    return (
      <div className="chat__sidebar">
        <h2>Open Chat</h2>
  
        <div>
          <h4 className="chat__header">FRIENDS LIST</h4>
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
                <p>
                  {user.username}
                  {connectedUsers.includes(user.id) && <span style={{ color: 'green' }}> en ligne</span>}</p>
              </Box>
            ))}
          </div>
        </div>
      </div>
    );
};

export default ChatFriends;
