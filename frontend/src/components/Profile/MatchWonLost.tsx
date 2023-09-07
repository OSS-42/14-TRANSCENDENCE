import { Box, Typography } from "@mui/material";

interface MatchWonLostProps {
  nbrMatchesWon: number;
  nbrMatchesLost: number;
}

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

export function MatchWonLost({nbrMatchesWon, nbrMatchesLost}: MatchWonLostProps) {

  return (
    <div>
      <MatchBox title="MATCH WON" matchCount={nbrMatchesWon} />
      <MatchBox title="MATCH LOST" matchCount={nbrMatchesLost} />
    </div>
  );
}
