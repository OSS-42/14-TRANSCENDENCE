import { Box, Button, Typography } from "@mui/material";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Welcome() {
  const { user, login } = useAuth();

  if (!user) {
    return (
      <Box
        component="div"
        id="welcome-page"
        // sx={{
        //   padding: '2rem',
        // }}
      >
        <Typography className="hero">PONG</Typography>
        <Box component="div" id="arcade" sx={{ marginBottom: "5rem" }}>
          <img width="100%" src="arcade.png" alt="" />
        </Box>
        <Button
          href="/api/auth/42"
          size="medium"
          variant="contained"
          onClick={login}
        >
          LOG IN
        </Button>
      </Box>
    );
  } else return <Navigate to="/" replace />;
}
