import { Box, Typography } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { User } from "../../models/User";

// interface MatchWonLostProps {
//   match:
// }

interface MatchBoxProps {
  title: string;
  matchCount: number;
}

interface CenteredTextProps {
  match: number;
}

function CenteredText({ match }: CenteredTextProps) {
  return (
    <div style={{ textAlign: "center" }}>
      <Box p={2}>
        <Typography variant="h1" style={{ color: "black", width: "100%" }}>
          {match}
        </Typography>
      </Box>
    </div>
  );
}

function MatchBox({ title, matchCount }: MatchBoxProps) {
  return (
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
        maxHeight: "370px",
        overflow: "auto",
        textAlign: "center",
      }}
    >
      {title}
      <CenteredText match={matchCount} />
    </Box>
  );
}

export function MatchWonLost({ match }: MatchWonLostProps) {
//   const [match, setMatch] = useState({
//     matchesWon: [],
//     matchesLost: [],
//   });

//   useEffect(() => {
//     if (user) {
//       async function fetchMatch() {
//         const jwt_token = Cookies.get("jwt_token");
//         try {
//           const response = await axios.get(
//             `http://localhost:3001/users/matchHistory/${user.id}`,
//             {
//               headers: {
//                 Authorization: "Bearer " + jwt_token,
//               },
//             }
//           );
//           console.log("Match stats inside AboutBox fetching successful");
//           setMatch(response.data);
//         } catch (error) {
//           console.error("Match stats fetching:", error);
//         }
//       }
//       fetchMatch();
//     }
//   }, [user]); // No need to put match as a dependency here, because user class has a gamewon gamelost variable that will change

  const nbrMatchesWon = match.matchesWon.length;
  const nbrMatchesLost = match.matchesLost.length;

  return (
    <div>
      <MatchBox title="MATCH WON" matchCount={nbrMatchesWon} />
      <MatchBox title="MATCH LOST" matchCount={nbrMatchesLost} />
    </div>
  );
}
