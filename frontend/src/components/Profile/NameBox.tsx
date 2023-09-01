import { Box } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";

export function NameBox(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");

  function handleDoubleClick() {
    setIsEditing(true);
  }

  function handleChange(event) {
    const newName = event.target.value;
    setEditedName(newName);
  }

  async function handleBlur() {
    if (editedName !== props.user) {
      const jwt_token = Cookies.get("jwt_token");
      try {
        const response = await axios.post(
          "http://localhost:3001/users/updateUsername",
          {newUsername: editedName},  
          {
            headers: {
              Authorization: "Bearer " + jwt_token,
            },
          }
        );
        console.log("Updating name was successful");
        props.setUser(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error updating user data:", error);
      }
    }
    setIsEditing(false);
  }
  
  return (
    <Box
      onDoubleClick={handleDoubleClick}
      component="div"
      sx={{
        border: "1px solid black",
        borderRadius: "5px",
        margin: "20px",
        fontWeight: "bold",
        fontSize: "20px",
        height: "5vh",
        padding: "20px",
      }}
    >
      {isEditing ? (
        <input
          type="text"
          value={editedName}
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        props.user
      )}
    </Box>
  );
}
