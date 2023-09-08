import { Socket } from "socket.io-client";
import { Box, Button } from "@mui/material";
import { User } from "../../models/User";
import { destroyFriend, fetchFriendsList } from "../../api/requests";

type ChatFriendsProps = {
  socket: Socket;
  connectedUsers: number[];
  friendsList: User[];
  setFriendsList: React.Dispatch<React.SetStateAction<User[]>>;
  handleUserClick: (user: User) => void;
};

//Allez chercher la liste des des utilisateurs connectedUsers a linititon du component.
//
const ChatFriends = ({
  setFriendsList,
  connectedUsers,
  handleUserClick,
  friendsList,
}: ChatFriendsProps) => {
  async function removeFriend(id: number) {
    await destroyFriend(id);
    const newFriendList = await fetchFriendsList();
    setFriendsList(newFriendList);
  }

  return (
    <div className="chat__sidebar">
      <div>
        <h4 className="chat__header">FRIENDS LIST</h4>
        <div className="chat__users">
          <p></p>
          {friendsList.map((user) => (
            <Box
              component="div"
              key={user.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "5px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                marginBottom: "5px",
              }}
            >
              <img
                src={user.avatar}
                alt={user.username}
                width="50"
                height="50"
                style={{ borderRadius: "50%" }}
                onClick={() => handleUserClick(user)}
              />

              <div>
                <p> {user.username}</p>
                {connectedUsers?.includes(user.id) && (
                  <span style={{ color: "green" }}> en ligne</span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  flex: "1",
                }}
              ></div>
              <Button variant="contained" onClick={() => removeFriend(user.id)}>
                Remove Friend
              </Button>
            </Box>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatFriends;
