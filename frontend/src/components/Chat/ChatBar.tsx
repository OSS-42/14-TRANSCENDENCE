import { Button } from "@mui/material";
import { Box } from "@mui/system";
import { Socket } from "socket.io-client";
import { addFriendApi, fetchFriendsList } from "../../api/requests";
import { useAuth } from "../../contexts/AuthContext";
import { User } from "../../models/User";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

type ChatFriendsProps = {
  socket: Socket;
  setUsersList: React.Dispatch<React.SetStateAction<User[]>>;
  setFriendsList: React.Dispatch<React.SetStateAction<User[]>>;
  usersList: User[];
  friendsList: User[];
  connectedUsers: number[];
  handleUserClick: (user: User) => void;
};

function ChatBar({
  handleUserClick,
  friendsList,
  setFriendsList,
  usersList,
  connectedUsers,
}: ChatFriendsProps) {
  const { user } = useAuth();
  const meId = user?.id;

  // Filtrer uniquement les utilisateurs en ligne
  const onlineUsers = usersList.filter((user) =>
    connectedUsers?.includes(user.id)
  );

  const addFriend = async (friendUsername: string) => {
    await addFriendApi(friendUsername);
    const updatedFriendsList = await fetchFriendsList();
    setFriendsList(updatedFriendsList);
  };

  return (
    <Box component="div" className="chat__sidebar">
      <Box
        component="div"
        sx={{ borderTop: "1px dashed #3d3242", paddingTop: "1rem" }}
      >
        <h4 className="chat__header">USERS LIST</h4>
        <div className="chat__users">
          <p></p>
          {onlineUsers
          .filter((user) => !friendsList.some((friend) => friend.id === user.id)) 
          .map((user) => (
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
                <p>{user.username}</p>
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
              >
                {user.id !== meId &&
                  !friendsList.some((friend) => friend.id === user.id) && (
                    <Button
                      variant="contained"
                      onClick={() => addFriend(user.username)}
                    >
                      Add Friend
                    </Button>
                  )}
              </div>
            </Box>
          ))}
        </div>
      </Box>
    </Box>
  );
}

export default ChatBar;
