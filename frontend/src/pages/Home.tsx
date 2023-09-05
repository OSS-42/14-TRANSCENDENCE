import { Box } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

// Idea: Welcome page containing a little summary of the project,
// and any extra thing we'd like to add.

export function Home() {
  const { user } = useAuth();

  return (
    <>
      <Box
        component="div"
        sx={{
          background: "#e4f7fb",
          borderRadius: "5px",
          margin: "10px",
          padding: "15px",
          height: "92.5vh",
        }}
      >
        {user ? (
          <>
            <p>Hi, {user.username}!</p>
            <p>Your email: {user.email}</p>
            <p>Your avatar link: {user.avatar}</p>
            <p>Your token: {user.jwtToken}</p>
            <p>Your id: {user.id}</p>
            {/* Display other user details as needed */}
          </>
        ) : (
          <p>Loading user data...</p>
        )}
      </Box>
    </>
  );
}
