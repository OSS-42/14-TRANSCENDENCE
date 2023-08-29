import { Box, Button, Typography, Grid } from "@mui/material";
import { Link } from "react-router-dom";

// To do: Connect the button to a function
// that deals with the 42 API for authentification
// and proceeds with the redirection to our homepage

export function Welcome() {
  return (
    <div className="welcome">
      <Grid
        container
        display="flex"
        flexDirection="column"
        height="100vh"
        style={{ minHeight: "90vh", background: "#66cccc" }}
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
    </div>
  );
}
