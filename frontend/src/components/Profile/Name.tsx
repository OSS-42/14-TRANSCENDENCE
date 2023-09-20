import { Alert, Box, Button, TextField } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { isUserExist } from "../../api/requests";
import { updateUser } from "../../api/requests";

import BorderColorIcon from "@mui/icons-material/BorderColor";

export function Name(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [updatedName, setUpdatedName] = useState(props.user);

  function handleOnClick() {
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
    if (username.length < 3 || username.length > 12) return false;
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
        alert("Invalid Username! Another user already has this username");
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
      component="div"
      sx={{
        borderRadius: "5px",
        margin: "1rem 0 1rem 0",
        textAlign: "center",
        width: "100%",
        height: "5vh",
        padding: "10px",
        alignContent: "space-around",
        typography: { xs: "h5", sm: "h4" },
      }}
    >
      {isEditing ? (
        <TextField
          type="text"
          // className="message"
          fullWidth={true}
          value={editedName}
          inputProps={{ style: { fontSize: ".8rem" } }}
          InputLabelProps={{ style: { fontSize: ".8rem" } }}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      ) : (
        <>
          <Box
            component="div"
            display="flex"
            justifyContent="space-around"
            alignContent="center"
          >
            {props.user}
            <Button
              sx={{
                minWidth: ".1",
                padding: ".2rem .6rem .2rem 0",
              }}
              size="small"
              color="secondary"
              type="submit"
              variant="contained"
              className="sendBtn"
              onClick={handleOnClick}
              endIcon={<BorderColorIcon />}
            />
          </Box>
        </>
      )}
    </Box>
  );
}
