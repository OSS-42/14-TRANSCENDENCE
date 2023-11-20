import { Box, Button, Modal, Typography } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";
import QRCode from "qrcode.react";

interface TwoFactorAuthenticationProps {
  TwoFactorStatus: boolean;
}

const BASE_URL = "/api";

export function TwoFactorAuthentication({
  TwoFactorStatus,
}: TwoFactorAuthenticationProps) {
  const [otpURL, setOtpURL] = useState("");
  const [isQRCodeVisible, setQRCodeVisible] = useState(false);
  const [isActivated, setIsActivated] = useState(TwoFactorStatus);
  const [verificationCode, setVerificationCode] = useState("");
  const jwt_token = Cookies.get("jwt_token");

  async function activate2FA() {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/activate2FA`,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwt_token}`,
          },
        }
      );
      setOtpURL(response.data.otpauthUrl);
      setQRCodeVisible(true);
    } catch (error) {
      console.error("Error fetching user 2FA", error);
      throw error;
    }
  }

  async function deactivate2FA() {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/deactivate2FA`,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwt_token}`,
          },
        }
      );
      alert(response.data.message);
      setOtpURL("");
      setQRCodeVisible(false);
    } catch (error) {
      console.error("Error disabling user 2FA", error);
      throw error;
    }
  }

  // function that submits the verification code
  async function submitVerificationCode() {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/verify2FA`,
        { token: verificationCode },
        {
          headers: {
            Authorization: `Bearer ${jwt_token}`,
          },
        }
      );
      if (response.data.message == "2FA code is valid.") {
        alert("2FA code is valid. 2FA is now activated");
        setQRCodeVisible(false);
        setVerificationCode("");
        setIsActivated(true);
      } else {
        alert("2FA code is invalid. Please re-enter code");
        setVerificationCode("");
      }
    } catch (error) {
      console.error("Error verifying 2FA code", error);
    }
  }

  function handle2FA() {
    if (isActivated) {
      setIsActivated(false);
      deactivate2FA();
    } else {
      activate2FA();
    }
  }

  return (
    <Box
      component="div"
      sx={{
        borderRadius: "5px",
        margin: "0 0 2rem 0",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <label>
        <Button
          color="secondary"
          variant="contained"
          size="medium"
          component="span"
          onClick={handle2FA}
          sx={{ typography: { xs: "body2" } }}
        >
          {isActivated ? "Deactivate 2FA" : "Activate 2FA"}
        </Button>
        <Modal open={isQRCodeVisible}>
          <Box
            component="div"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "white",
              border: "2px solid #000",
              textAlign: "center",
              borderRadius: "5px",
              p: 2,
            }}
          >
            <Typography variant="h5">Activate 2FA</Typography>
            <br />
            <QRCode value={otpURL} size={256} />
            <Typography variant="h6">
              <br /> Scan the QR code with your authenticator app and enter the
              6-digits number of your app below to make sure 2FA is set up
              correctly!
            </Typography>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              minLength={6}
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              style={{ margin: "10px" }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={submitVerificationCode}
              disabled={verificationCode.length !== 6}
            >
              Submit Code
            </Button>
          </Box>
        </Modal>
      </label>
    </Box>
  );
}
