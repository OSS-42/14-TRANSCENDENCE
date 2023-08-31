import { Box } from "@mui/material";

export function NameBox(props) {
  
	return (
    <Box
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
      UserName: {props.user}
    </Box>
  );
}
