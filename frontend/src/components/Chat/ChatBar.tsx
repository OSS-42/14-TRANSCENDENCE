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
}: ChatFriendsProps) {
  const { user } = useAuth();
  const meId = user?.id;

  const addFriend = async (friendUsername: string) => {
    await addFriendApi(friendUsername);
    const updatedFriendsList = await fetchFriendsList();
    setFriendsList(updatedFriendsList);
  };

  // Filtrer uniquement les utilisateurs qui ne sont pas dans votre liste d'amis
  const nonFriendsUsers = usersList.filter(
    (user) => !friendsList.some((friend) => friend.id === user.id)
  );

  return (
    <Box component="div" className="chat__sidebar">
      <Box
        component="div"
        sx={{ borderTop: "1px dashed #3d3242", paddingTop: "1rem" }}
      >
        <h4 className="chat__header">USERS LIST</h4>
        <div className="chat__users">
          <p></p>
          {nonFriendsUsers.map((user) => (
            <Box
              component="div"
              key={user.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "5px",
                // border: "1px solid #ccc",
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
                {user.id === meId &&   <span style={{ color: "#65bf76" }}>online</span>}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  flex: "1",
                }}
              >
                {user.id !== meId && (
                  <Button
                    sx={{
                      minWidth: ".1",
                      padding: ".2rem .2rem .2rem 1rem",
                    }}
                    variant="contained"
                    color="secondary"
                    startIcon={<PersonAddIcon />}
                    onClick={() => addFriend(user.username)}
                  />
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
