import { Box } from "@mui/material";
import { useState } from "react";

export function NameBox(props, set) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(props.user);

  function handleDoubleClick() {
    setIsEditing(true);
  }

  function handleBlur() {
    setIsEditing(false);
    // Save the edited user content when blur (e.g., when clicking outside the input field)
	props.onEdit(editedUser)
  }

  function handleChange(event) {
    setEditedUser(event.target.value);
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
          value={editedUser}
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
