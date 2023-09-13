import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import QRCode from "qrcode.react";

const BASE_URL = "/api";

export function TwoFactorAuthentication() {
  const [otpURL, setOtpURL] = useState("");
  const [isQRCodeVisible, setQRCodeVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const jwt_token = Cookies.get("jwt_token");

  async function fetchUserVerification() {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/enable2FA`,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwt_token}`,
          },
        }
      );
      setOtpURL(response.data.otpauthUrl);
      console.log(response.data.otpauthUrl);
      setQRCodeVisible(true);
    } catch (error) {
      console.error("Error fetching user 2FA", error);
      throw error;
    }
  }

  async function handleSubmit() {
    console.log("Verification code is: ",verificationCode);
    console.log(typeof verificationCode);
    try {
      // Make an API call to validate the verification code
      const response = await axios.post(
        `${BASE_URL}/auth/verify2FA`,
        {
          token: verificationCode,
        },
        {
          headers: {
            Authorization: `Bearer ${jwt_token}`,
          },
        }
      );

      // Handle the response as needed
      console.log("Verification response:", response.data);

      // Close the modal
      setQRCodeVisible(false);
    } catch (error) {
      console.error("Error verifying 2FA code", error);
      // Handle errors here
    }
  }

  return (
    <Box
      component="div"
      sx={{
        border: "1px solid black",
        borderRadius: "5px",
        margin: "20px",
        width: "50%",
        display: "flex",
        justifyContent: "center", // Center horizontally
        alignItems: "center", // Center vertically
      }}
    >
      <label>
        <Button
          variant="contained"
          size="large"
          component="span"
          onClick={fetchUserVerification}
        >
          Activate 2FA
        </Button>
        <Modal open={isQRCodeVisible} onClose={() => setQRCodeVisible(false)}>
          <Box
            component="div"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "white",
              border: "2px solid #000",
              p: 2,
            }}
          >
            <Typography variant="h5">Set up 2FA</Typography>
            <Typography>Follow the instructions below:</Typography>
            <QRCode value={otpURL} size={256} />
            <Typography>
              Scan the QR code with your authenticator app.
            </Typography>
            <Typography>Enter the verification code from the app:</Typography>
            <TextField
              variant="outlined"
              fullWidth
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Verify
            </Button>
          </Box>
        </Modal>
      </label>
    </Box>
  );
}
