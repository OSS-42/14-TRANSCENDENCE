import { Button } from "@mui/material";
import { Box } from "@mui/system";
import { Socket } from "socket.io-client";
import { addFriendApi, fetchFriendsList } from "../../api/requests";
import { useAuth } from "../../contexts/AuthContext";
import { User } from "../../models/User";

//On va remplacer cette ligne quand on aura le context
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

  const addFriend = async (friendUsername: string) => {
    await addFriendApi(friendUsername);
    const updatedFriendsList = await fetchFriendsList();
    setFriendsList(updatedFriendsList);
  };

  return (
    <div className="chat__sidebar">
      <div>
        <h4 className="chat__header">USERS LIST</h4>
        <div className="chat__users">
          <p></p>
          {usersList.map(
            (user) =>
              !friendsList.some((friend) => friend.id === user.id) && (
                <Box
                  component="div"
                  key={user.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "5px",
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
                      <span style={{ color: "#65bf76" }}> en ligne</span>
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
              )
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatBar;
