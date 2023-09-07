import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "../../models/User";

interface MatchHistoryProps {
  user: User;
}

export function MatchHistory({user} : MatchHistoryProps ) {
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
          console.log("Match stats fetching successful");
          console.log(response.data);
          setMatch(response.data);
        } catch (error) {
          console.error("Match stats fetching:", error);
        }
      }
      fetchMatch();
    }
  }, [user]);  // No need to put match as a dependency here, because user class has a gamewon gamelost variable that will change

  if (!match.matchesWon || match.matchesWon.length === 0) {
    return <p>No match data available.</p>;
  }

  return (
	<Box
	  component="div"
      sx={{
        border: "1px solid black",
        borderRadius: "5px",
        margin: "20px",
        fontWeight: "bold",
        height: "28vh",
        maxHeight: "370px", // Set a maximum height for scrolling
        overflow: "auto", // Enable scrolling when content overflows
      }}
    >
    <TableContainer component={Paper} sx={{ backgroundColor: "white" }}>
      <Typography variant="h6" sx={{ padding: "16px" }}>
        Match History
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Winner</TableCell>
            <TableCell>Loser</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {match.matchesWon.map((matches, index) => (
            <TableRow key={index}>
              <TableCell>{matches.date}</TableCell>
              <TableCell>{matches.winner}</TableCell>
              <TableCell>{matches.loser}</TableCell>
            </TableRow>
          ))}
          {match.matchesLost.map((matches, index) => (
            <TableRow key={index}>
              <TableCell>{matches.date}</TableCell>
              <TableCell>{matches.winner}</TableCell>
              <TableCell>{matches.loser}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
	</Box>
  );
}
