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
import { Matches } from "../../models/User";

interface MatchHistoryProps {
  match: Matches;
}

export function MatchHistory({ match }: MatchHistoryProps) {
  if (!match.matchesWon || !match.matchesLost) {
    return <p>No match data available.</p>;
  }

  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  }

  return (
    <Box
      component="div"
      sx={{
        borderTop: "1px dashed #3d3242",
        marginTop: "20px",
        padding: "1rem",
        height: "28vh",
        maxHeight: "370px",
        overflow: "auto",
      }}
    >
      <Typography sx={{ typography: { xs: "h6", sm: "h5" } }}>
        MATCH HISTORY
      </Typography>
      {match.matchesWon.length > 0 || match.matchesLost.length > 0 ? (
        <TableContainer
          component={Paper}
          sx={{ backgroundColor: "transparent" }}
        >
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
                  <TableCell>{formatDate(matches.date)}</TableCell>
                  <TableCell>{matches.winner}</TableCell>
                  <TableCell>{matches.loser}</TableCell>
                </TableRow>
              ))}
              {match.matchesLost.map((matches, index) => (
                <TableRow key={index}>
                  <TableCell>{formatDate(matches.date)}</TableCell>
                  <TableCell>{matches.winner}</TableCell>
                  <TableCell>{matches.loser}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <div>
          <Typography
            sx={{
              typography: { xs: "body2", sm: "h6" },
              padding: "16px",
              // fontWeight: 'bold',
            }}
          >
            No games have been played yet ...
          </Typography>
        </div>
      )}
    </Box>
  );
}
