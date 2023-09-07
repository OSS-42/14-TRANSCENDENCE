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

interface Match {
	matchesWon: Array<{ date: string; winner: string; loser: string }>;
  	matchesLost: Array<{ date: string; winner: string; loser: string }>;
}

interface MatchHistoryProps {
  match: Match;
}

export function MatchHistory({match}: MatchHistoryProps) {
  if (!match.matchesWon || !match.matchesLost) {
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
