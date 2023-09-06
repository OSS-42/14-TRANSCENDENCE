import { Grid, Box, Button, Avatar } from "@mui/material";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { User } from "../models/User";
import axios from "axios";

export function Profile() {
	
  const [user, setUser] = useState<User>();
  const [selectedAvatar, setSelectedAvatar] = useState(null); // This set the selectedAvatar variable to null.

  useEffect(() => {
    async function fetchUsersData() {
      const jwt_token = Cookies.get("jwt_token");
      try {
        const response = await axios.get("http://localhost:3001/users/me", {
          headers: {
            Authorization: "Bearer " + jwt_token,
          },
        });
        setUser(response.data);
        console.log(user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUsersData();
  }, []);

  const handleAvatarSelected = (event) => {
    const selectedFile = event.target.files[0];    
	//console.log(selectedFile);                      // To be removed 
    if (selectedFile) {
      setSelectedAvatar(selectedFile);
      handleAvatarUpdate(selectedFile);
    }
  };

  const handleAvatarUpdate = async (avatarFile: File) => {
    const formData = new FormData();
	console.log(avatarFile);
    formData.append('avatar', avatarFile);
	const jwt_token = Cookies.get("jwt_token");

    try {
      await axios.post("http://localhost:3001/users/updateAvatar", formData, {
		headers: {
		  Authorization: "Bearer " + jwt_token,
		},
	  });
      console.log('Avatar updated successfully');
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  return (
    <Grid
      container
      sx={{
        border: "1px solid black",
        borderRadius: "5px",
        height: "95vh",
        width: "95vw",
        margin: "10px",
        boxSizing: "border-box",
      }}
    >
      <Grid
        item
        xs={4}
        sx={{
          border: "1px solid black",
		  borderRadius: "5px",
          margin: "20px",
        }}
      >
        <Box
          component="div"
          sx={{
            border: "1px solid black",
			borderRadius: "5px",
            margin: "20px",
            fontWeight: "bold",
			fontSize: "20px",
            height: "5vh",
          }}
        >
          Name: {user?.username}
        </Box>
        <Box
        component="div"
          sx={{
            border: "1px solid black",
			borderRadius: "5px",
            margin: "20px",
            fontWeight: "bold",
            height: "30vh",
            width: "50%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Avatar
            alt="Username"
            src={user?.avatar}
            sx={{
              width: "100%", // Allow width to adjust
              height: "100%", // Fill the available height
              maxWidth: "100%",
            }}
          />
        </Box>
        <Box
         component="div"
          sx={{
            border: "1px solid black",
			borderRadius: "5px",
            margin: "20px",
			width: "50%",
			display: 'flex',
			justifyContent: 'center', // Center horizontally
			alignItems: 'center', // Center vertically
          }}
        >
          <input
            type="file" // Indicated that we will select a type file
            accept="image/*" // It only indicates that I accept images
            onChange={handleAvatarSelected}
            style={{ display: "none" }} // Hide the input element totally
            id="avatar-input" // Creates a specific id for the input
          />
          <label htmlFor="avatar-input">
            <Button variant="contained" size="large" component="span">
              Change Avatar
            </Button>
          </label>
        </Box>
      </Grid>
      <Grid
        item
        xs={7}
        sx={{
          border: "1px solid black",
		  borderRadius: "5px",
          margin: "20px",
        }}
      >
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
          ABOUT
        </Box>
        <Box
          sx={{
            border: "1px solid black",
            margin: "20px",
            fontWeight: "bold",
            height: "28vh",
            maxHeight: "370px", // Set a maximum height for scrolling
            overflow: "auto", // Enable scrolling when content overflows
          }}
        >
          STATS
        </Box>
        <Box
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
          FRIEND LISTS
        </Box>
      </Grid>
    </Grid>
  );
}