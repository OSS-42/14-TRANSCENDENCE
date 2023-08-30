import { Box } from "@mui/material";

export function FriendsListBox({children}) {
  return (
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
		{children}
    </Box>
  );
}