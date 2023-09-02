
import { Socket } from "socket.io-client";
import { Box } from "@mui/material";
import { User } from "../../models/User";


////ON VA DEVOIR PEUT ETRE UTILISER REDUX AFIN DAVOIR DES STATES GLOBALES


type ChatFriendsProps = {
  socket: Socket; // Assurez-vous que ce type correspond au type de socket que vous utilisez // Setter pour usersList
  connectedUsers: number[]; 
  friendsList: User[]; 
};


//Allez chercher la liste des des utilisateurs connectedUsers a linititon du component.
//
const ChatFriends = ({ socket, connectedUsers, friendsList }: ChatFriendsProps) => {
 
  
  console.log(friendsList)
  
    return (
      <div className="chat__sidebar">
        <h2>Open Chat</h2>
  
        <div>
          <h4 className="chat__header">FRIENDS LIST</h4>
          <div className="chat__users">
            <p></p>
            {friendsList.map((user, index) => (
              <Box
                key={user.id}
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
