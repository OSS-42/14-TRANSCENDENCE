import { Box, Typography } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { User } from "../../models/User";

export function CenteredText(props) {
  return (
    <div style={{ textAlign: "center" }}>
      <Box p={2}>
        <Typography variant="h1" style={{ color: "black", width: "100%" }}>
		   {props.match}
        </Typography>
      </Box>
    </div>
  );
}

interface MatchWonLostProps {
  user: User;
}

export function MatchWonLost({ user }: MatchWonLostProps) {
  const [match, setMatch] = useState({
    matchesWon: [],
    matchesLost: [],
  });

  useEffect(() => {
    if (user) {
      async function fetchMatch() {
        const jwt_token = Cookies.get("jwt_token");
        try {
          const response = await axios.get(
            `http://localhost:3001/users/matchHistory/${user.id}`,
            {
              headers: {
                Authorization: "Bearer " + jwt_token,
              },
            }
          );
          console.log("Match stats inside AboutBox fetching successful")
          setMatch(response.data);
        } catch (error) {
          console.error("Match stats fetching:", error);
        }
      }
      fetchMatch();
    }
  }, [user]); // No need to put match as a dependency here, because user class has a gamewon gamelost variable that will change

  return (
    <div>
      <Box
        component="div"
        display="inline-block"
        sx={{
          border: "1px solid black",
          borderRadius: "5px",
          margin: "20px",
          fontWeight: "bold",
          height: "28vh",
          width: "45%",
          maxHeight: "370px", // Set a maximum height for scrolling
          overflow: "auto", // Enable scrolling when content overflows
          textAlign: "center",
        }}
      >
        MATCH WON
        <CenteredText match={match.matchesWon.length}/>
      </Box>
      <Box
        component="div"
        display="inline-block"
        sx={{
          border: "1px solid black",
          borderRadius: "5px",
          margin: "20px",
          fontWeight: "bold",
          height: "28vh",
          width: "45%",
          maxHeight: "370px", // Set a maximum height for scrolling
          overflow: "auto", // Enable scrolling when content overflows
          textAlign: "center",
        }}
      >
        MATCH LOST
        <CenteredText match={match.matchesLost.length}/>
      </Box>
    </div>
  );
}
