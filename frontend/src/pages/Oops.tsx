import { Box } from "@mui/material";

//(Extremely) Generic error page.

export function Oops() {
  return (
    <Box
      component="div"
      sx={{
        background: "#e4f7fb",
        borderRadius: "5px",
        margin: "10px",
        padding: "15px",
        height: "92.5vh",
        textAlign: "center",
      }}
    >
      <strong>Oops!</strong> <br />
      <br />
      You're already connected somewhere else.
    </Box>
  );
}
