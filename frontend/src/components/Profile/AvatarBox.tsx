import { Box, Avatar } from "@mui/material";

export function AvatarBox() {
  return (
    <div>
      <Box
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
          //   src={user?.avatar}
          sx={{
            width: "100%", // Allow width to adjust
            height: "100%", // Fill the available height
            maxWidth: "100%",
          }}
        />
      </Box>
    </div>
  );
}
