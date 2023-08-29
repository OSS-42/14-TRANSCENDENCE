import { Box } from "@mui/material";

export function ChangeAvatarBox() {
  return (
    <div>
      <Box
        sx={{
          border: "1px solid black",
          borderRadius: "5px",
          margin: "20px",
          width: "50%",
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
          <Button variant="contained" size="large" component="span">
            Change Avatar
          </Button>
        </label>
      </Box>
    </div>
  );
}
