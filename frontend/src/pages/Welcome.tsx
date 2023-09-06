import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export function Welcome() {
  return (
    <Box
      component="div"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      style={{ height: "100vh", background: "#66cccc" }}
    >
      <Typography
        sx={{
          textAlign: "center",
          textShadow:
            "0px 2px 5px rgba(0, 0, 0, 0.25), -2px -2px 4px rgba(0, 0, 0, 0.25)",
        }}
        style={{ color: "#fffff6" }}
        variant="h1"
        justifyContent="center"
      >
        Welcome to Pong!
      </Typography>
      <Box component="div" sx={{ marginBottom: "5rem" }}>
        <img src="welcome.gif" alt="" />
      </Box>
      <Link to="http://localhost:3001/auth/42">
        <Button variant="contained">LOG IN</Button>
      </Link>
    </Box>
  );
}
