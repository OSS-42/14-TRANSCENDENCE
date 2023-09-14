import { Box, Avatar } from "@mui/material";
import { User } from "../../models/User";

interface AvatarImageProps{
	user: User;
}

export function AvatarImage({user} : AvatarImageProps) {
  return (
      <Box
	  	component="div"
        sx={{
          borderRadius: "5px",
          margin: "20px",
          fontWeight: "bold",
          // height: "30vh",
          width: "50%",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <Avatar
          alt="Username"
          src={user?.avatar}
          sx={{
            width: "100%", // Allow width to adjust
            height: "100%", // Fill the available height
            maxWidth: "100%",
            objectFit: "cover",
          }}
        />
      </Box>
  );
}
