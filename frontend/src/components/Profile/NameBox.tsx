import { Box } from "@mui/material";
import { useState } from "react";

export function NameBox(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState("");

  function handleDoubleClick() {
    setIsEditing(true);
  }

  function handleBlur() {
	
  }

  function handleChange(event) {
	const newUserName = event.target.value;
	console.log ("New User Name:", newUserName);
  }

//   const handleNameEdit = async (editedUser) => {
//     const jwt_token = Cookies.get("jwt_token");
//     try {
//       const response = await axios.post(
//         "http://localhost:3001/users/updateUsername",
//         editedUser,
//         {
//           headers: {
//             Authorization: "Bearer " + jwt_token,
//           },
//         }
//       );
//       console.log("HandleNameEdit:", response.data);
//       setUser(editedUser);
//     } catch (error) {
//       console.error("Error updating user data:", error);
//     }
//   };

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
