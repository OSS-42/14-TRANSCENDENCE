import { Box, Button, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";

export function Welcome() {
  // Gestionnaire d'événements pour le clic sur le bouton "LOG IN"
  const handleLoginClick = () => {
    // Attendre 1000 millisecondes (1 seconde) avant de recharger la page
    setTimeout(() => {
      window.location.reload();
    }, 1000); // 1000 millisecondes = 1 seconde
  };

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
