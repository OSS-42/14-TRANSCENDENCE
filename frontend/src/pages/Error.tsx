import { Box } from "@mui/material";

export function Error() {
  return (
    <Box
      component="div"
      sx={{
        background: "#e4f7fb",
        borderRadius: "5px",
        margin: "10px",
        padding: "15px",
        height: "25vh",
        textAlign: "center",
        marginTop: "3rem",
      }}
    >
      <strong>Error!</strong> <br />
      <br />I not sure where you're trying to go, but that page doesn't exist.
      <br />(Make sure you're not connected somewhere else!)
    </Box>
  );
}
