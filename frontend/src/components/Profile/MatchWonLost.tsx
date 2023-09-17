import { Box, Grid, Typography } from '@mui/material'
import { Matches } from '../../models/User'

interface MatchWonLostProps {
  match: Matches
}

interface MatchBoxProps {
  title: string
  matchCount: number
}

interface CenteredTextProps {
  match: number
}

function CenteredText({ match }: CenteredTextProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <Box component="div">
        <Typography variant="h1" style={{ color: 'black', width: '100%' }}>
          {match}
        </Typography>
      </Box>
    </div>
  )
}

function MatchBox({ title, matchCount }: MatchBoxProps) {
  return (
    <Grid item xs={12} sm={6}>
      <Box
        component="div"
        sx={{
          border: '1px solid black',
          borderRadius: '5px',
          margin: '20px',
          marginBottom: '5px',
          fontWeight: 'bold',
          height: '21vh',
          maxHeight: '370px',
          overflow: 'auto',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        <CenteredText match={matchCount} />
      </Box>
    </Grid>
  )
}

export function MatchWonLost({ match }: MatchWonLostProps) {
  const nbrMatchesWon = match.matchesWon.length
  const nbrMatchesLost = match.matchesLost.length

  return (
    <Grid container spacing={2}>
      <MatchBox title="MATCH WON" matchCount={nbrMatchesWon} />
      <MatchBox title="MATCH LOST" matchCount={nbrMatchesLost} />
    </Grid>
  )
}

// function MatchBox({ title, matchCount }: MatchBoxProps) {
//   return (
//     <Box
//       component="div"
//       display="inline-block"
//       sx={{
//         border: "1px solid black",
//         borderRadius: "5px",
//         margin: "20px",
//         fontWeight: "bold",
//         height: "28vh",
//         width: "44.5%",
//         maxHeight: "370px",
//         overflow: "auto",
//         textAlign: "center",
//       }}
//     >
//       {title}
//       <CenteredText match={matchCount} />
//     </Box>
//   );
// }

// export function MatchWonLost({ match }: MatchWonLostProps) {
//   const nbrMatchesWon = match.matchesWon.length;
//   const nbrMatchesLost = match.matchesLost.length;

//   return (
//     <div>
//       <MatchBox title="MATCH WON" matchCount={nbrMatchesWon} />
//       <MatchBox title="MATCH LOST" matchCount={nbrMatchesLost} />
//     </div>
//   );
// }
