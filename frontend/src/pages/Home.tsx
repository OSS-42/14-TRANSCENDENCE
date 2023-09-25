import { Box } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

export function Home() {
  const { user } = useAuth();

  return (
    <>
      <Box
        component="div"
        sx={{
          marginTop: "3rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          background: "#c9c9c5",
          borderRadius: "5px",
          padding: "2.5rem",
          textAlign: "center",
          lineHeight: "2rem",
          fontSize: ".5rem",
          "@media (min-width:600px)": {
            fontSize: "1rem",
          },
        }}
      >
        {user ? (
          <>
            <div className="text">
              Hey there, {user.username}. :) <br /> Welcome to our
              ft_transcendence!
              <br />
              Hope you have some fun exploring around. <br />
              To edit your user details, go to your profile page. ;)
            </div>
            <div className="sign">
              <p>
                <br />
                Ana
                <br />
                Cesar
                <br />
                Eric
                <br />
                Morgan
                <br />
                Sam
                <br />
                🖤
              </p>
            </div>
            <div className="chicken-dance">
              <img src="../public/chickenhome.gif" />
            </div>
          </>
        ) : (
          <p>Loading user data...</p>
        )}
      </Box>
    </>
  );
}
