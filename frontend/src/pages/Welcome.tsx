import { Box, Button, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Welcome() {

  const { login } = useAuth();
  console.log("Allo");

  return (
    <Box
      component="div"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      style={{ height: "100vh", background: "#000" }}
    >
      {/* <Typography
        sx={{
					marginBottom: "5rem",
          textAlign: "center",
          textShadow:
            "0px 2px 5px rgba(0, 0, 0, 0.25), -2px -2px 4px rgba(0, 0, 0, 0.25)",
        }}
        style={{ color: "#f7de9f" }}
        variant="h1"
        justifyContent="center"
      >
        Welcome to Pong!
      </Typography> */}
      <Box component="div" sx={{ marginBottom: "5rem" }}>
        <img width="100%" src="arcade.png" alt="" />
      </Box>
      <NavLink to="/api/auth/42">
        <Button variant="contained" onClick={login}>
          LOG IN
        </Button>
      </NavLink>
    </Box>
  );
}
