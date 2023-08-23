import { Box } from "@mui/system";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { User } from "../../models/User";

 type someProp = {
  socket: Socket;
};


function ChatBar (socket:someProp) {
  const [usersList, setUsersList] = useState<User[]>([]);
  

  useEffect(() => {
    async function fetchUsersData() {
      const jwt_token = Cookies.get('jwt_token');
      try {
        const response = await axios.get('http://localhost:3001/users/allUsers', {
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
        <h4 className="chat__header">ACTIVE USERS</h4>
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
            </Box>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatBar;
