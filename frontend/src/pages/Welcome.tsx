import { Box, Button, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Welcome() {
  const handleLoginClick = () => {
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const { login } = useAuth();

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
      {/* Utilisez le gestionnaire d'événements onClick pour gérer le clic */}
      <NavLink to="/api/auth/42">
        <Button variant="contained" onClick={handleLoginClick}>
          LOG IN
        </Button>
      </NavLink>
    </Box>
  );
}
