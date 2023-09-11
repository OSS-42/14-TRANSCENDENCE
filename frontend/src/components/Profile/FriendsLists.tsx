import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export function FriendsList() {
  const [friends, setFriends] = useState(["No friends for the moment ..."]); // SetState. Initialize friend to empty array
  const jwt_token = Cookies.get("jwt_token"); // Cookies to identify user.

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(
          "api/users/friendsList",
          {
            headers: {
              Authorization: "Bearer " + jwt_token,
            },
          }
        );
        console.log("Friends list fetching successful");
        setFriends(response.data);
      } catch (error) {
        console.error("Friends list fetching:", error);
      }
    };

    fetchFriends();
  }, []);

  return (
    <Box
      component="div"
      sx={{
        border: "1px solid black",
        borderRadius: "5px",
        margin: "20px",
        fontWeight: "bold",
        height: "28vh",
        maxHeight: "370px", // Set a maximum height for scrolling
        overflow: "auto", // Enable scrolling when content overflows
      }}
    >
      FRIENDS
      <ul>
        {friends.map((friend, index) => (
          <Box
            component="div"
            key={index}
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
              src={friend.avatar}
              alt={friend.username}
              width="50"
              height="50"
              style={{ borderRadius: "50%" }}
            />
            <p>
              {friend.username}
              {/* {connectedUsers.includes(user.id) && (
                <span style={{ color: "green" }}> en ligne</span>
              )} */}
            </p>
          </Box>
        ))}
      </ul>
    </Box>
  );
}
