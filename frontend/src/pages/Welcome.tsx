import { Box, Button, Typography, Grid } from "@mui/material";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

// To do: Connect the button to a function
// that deals with the 42 API for authentification
// and proceeds with the redirection to our homepage

export function Welcome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);

  return (
    <Grid
      container
      display="flex"
      flexDirection="column"
      style={{ height: "100vh", background: "#66cccc" }}
    >
      <Grid
        xs
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding="50px"
      >
        <Typography
          sx={{
            textShadow:
              "0px 2px 5px rgba(0, 0, 0, 0.25), -2px -2px 4px rgba(0, 0, 0, 0.25)",
          }}
          style={{ color: "#fffff6" }}
          variant="h1"
          justifyContent="center"
        >
          Welcome to Pong!
        </Typography>
      </Grid>
      <Grid xs display="flex" justifyContent="center" alignItems="center">
        <img src="welcome.gif" alt="" />
      </Grid>
      <Grid xs display="flex" justifyContent="center" alignItems="center">
        <Link to="http://localhost:3001/auth/42">
          <Button variant="contained">LOG IN</Button>
        </Link>
      </Grid>
    </Grid>
  );
}
