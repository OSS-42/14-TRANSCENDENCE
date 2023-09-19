import { Box } from "@mui/material";

//(Extremely) Generic error page.

export function Error() {
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
      <strong>Error!</strong> <br />
      <br />I not sure where you're trying to go, but that page doesn't exist.
    </Box>
  );
}
