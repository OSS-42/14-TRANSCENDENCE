import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export function FriendsListBox() {
  const [friends, setFriends] = useState(["No friends for the moment ..."]); // SetState. Initialize friend to empty array
  const jwt_token = Cookies.get("jwt_token"); // Cookies to identify user.

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/users/friendsList",
          {
            headers: {
              Authorization: "Bearer " + jwt_token,
            },
          }
        );
        console.log("Friends list fetching successful");
        console.log(response);
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
          <li key={index}>{friend}</li>
        ))}
      </ul>
    </Box>
  );
}
