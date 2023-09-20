import { Box } from "@mui/material";

export function TwoFactor() {
  return (
    <Box
      component="div"
      sx={{
        background: "#e4f7fb",
        borderRadius: "5px",
        margin: "10px",
        padding: "15px",
        height: "92.5vh",
        textAlign: "center",
      }}
    >
      <strong>Welcome to the 2FA page!</strong> <br />
      <br />Please enter your 6 digit-code that you can find on your authenticator application
    </Box>
  );
}