import { Alert, Box } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";
import { isUserExist } from "../../api/requests";
import { updateUser } from "../../api/requests";

export function Name(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");

  function handleDoubleClick() {
    setIsEditing(true);
  }

  function handleChange(event) {
    const newName = event.target.value;
    setEditedName(newName);
  }

  function UserNameCharacters(username: string) {
    for (let i = 0; i < username.length; i++) {
      const char = username[i];
      console.log("Printing:", username[i]);
      if (!/[a-zA-Z0-9]/.test(char)) {
        return false;
      }
    }
    return true;
  }

  function UserNameLength(username: string) {
    if (username.length < 3 || username.length > 12) 
		return false;
    return true;
  }

  async function handleBlur() {
    if (editedName !== props.user) {
      if (editedName.trim() === "") {
        alert("You cannot have an empty name. Please enter name");
        setEditedName(props.user);
        return;
      }
      if (UserNameCharacters(editedName) === false) {
        alert(
          "Invalid Username! You username must ONLY contain letters or numbers. No special characters are authorized "
        );
        setEditedName(props.user);
        return;
      }
      if (UserNameLength(editedName) === false) {
        alert(
          "Invalid Username! Username must contained between 3 to 12 characters."
        );
        setEditedName(props.user);
        return;
      }
      const Name = await isUserExist(editedName);
      if (Name === true) {
		alert(
			"Invalid Username! Another user already has this username"
		  );
        setEditedName(props.user);
        return;
      }
      const newUser = await updateUser(editedName);
      props.updateUserData(newUser);
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
        width: "50%",
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