import { Box, Button, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

// To do: Connect the button to a function
// that deals with the 42 API for authentification
// and proceeds with the redirection to our homepage

export function Welcome() {
  const navigate = useNavigate();
  const { user, loginUser } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);

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
      <Button
        variant="contained"
        onClick={loginUser}
      >
        LOG IN
      </Button>
    </Box>
  );
}
