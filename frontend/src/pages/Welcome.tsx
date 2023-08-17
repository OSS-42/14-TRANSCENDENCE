import { Button, Typography, Grid } from "@mui/material";
import { Link } from "react-router-dom";

export function Welcome() {
  return (
    <Grid
      container
      spacing={2}
      display="flex"
      flexDirection="column"
      style={{ minHeight: "100vh" }}
    >
      <Grid xs display="flex" justifyContent="center" alignItems="center">
        <Typography variant="h1" justifyContent="center">
          Welcome to Pong!
        </Typography>
      </Grid>
      <Grid display="flex" justifyContent="center" alignItems="center">
        <img src="pong.gif" alt="" />
      </Grid>
      <Grid xs display="flex" justifyContent="center" alignItems="center">
        <Link to="/login">
          <Button variant="contained" color="secondary">
            LOG IN
          </Button>
        </Link>
      </Grid>
    </Grid>
  );
}
