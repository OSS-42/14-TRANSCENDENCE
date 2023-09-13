import { Box, Button, Modal } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import QRCode from "qrcode.react"

const BASE_URL = "/api";

export function TwoFactorAuthentication() {
  const [otpURL, setOtpURL] = useState("");
  const [isQRCodeVisible, setQRCodeVisible] = useState(false);
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
          <QRCode value={otpURL} size={256} />
        </Box>
    </Modal>
      </label>
    </Box>
  );
}
