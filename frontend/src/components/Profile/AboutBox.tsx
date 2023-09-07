import { Box, Typography } from "@mui/material";

export function CenteredText () {
  return (
    <div style={{ textAlign: "center" }}>
      <Box p={2}>
        <Typography variant="h1" style={{ color: "black", width: "100%" }}>
          0
        </Typography>
      </Box>
    </div>
  );
};

export function AboutBox() {
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
		<CenteredText/>
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
		<CenteredText/>
      </Box>
    </div>
  );
}
