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
          background: "#c6c5c8",
          borderRadius: "5px",
          margin: "10px",
          padding: "15px",
          height: "92.5vh",
          overflowWrap: "anywhere",
          overflow: "auto"
        }}
      >
        {user ? (
          <>
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
