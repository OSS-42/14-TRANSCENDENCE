import { Box, Button } from '@mui/material'
import axios from 'axios'
import Cookies from 'js-cookie'

export function ChangeAvatarButton({ setUser }) {
  const handleAvatarSelected = (event: any) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      console.log("The selected file is:", selectedFile);
      handleAvatarUpdate(selectedFile);
    }
  };

  const handleAvatarUpdate = async (avatarFile: File) => {
    const formData = new FormData();
    console.log(avatarFile);
    formData.append("avatar", avatarFile);
    const jwt_token = Cookies.get("jwt_token");

    try {
      const response = await axios.post("api/users/updateAvatar", formData, {
        headers: {
          Authorization: "Bearer " + jwt_token,
        },
      });
      console.log("Avatar updated successfully");
      setUser(response.data);
    } catch (error) {
      if (error.message === "Request failed with status code 413")
        alert("Image is too large. Please choose a smaller image");
      console.error("Error updating avatar:", error);
    }
  };

  return (
    <Box
      component="div"
      sx={{
        borderRadius: "5px",
        margin: "2rem 0 1rem 0",
        width: "100%",
        display: "flex",
        justifyContent: "center", // Center horizontally
        alignItems: "center", // Center vertically
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
        <Button
          color="secondary"
          variant="contained"
          size="medium"
          component="span"
          sx={{ typography: { xs: "body2" } }}
        >
          Change Avatar
        </Button>
      </label>
    </Box>
  );
}
