import { Box, Button } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";
import { twoFactorValidationStatus } from "../api/requests";
import { useAuth } from "../contexts/AuthContext";
import { useRoutes } from "../contexts/RoutesContext";

export function TwoFactor() {
  const [inputValue, setInputValue] = useState("");
  const jwt_token = Cookies.get("jwt_token");
  const { navigateTo } = useRoutes();
  const { setUser } = useAuth();

//   async function handleTwo() {
//     const newUser = await twoFactorValidationStatus(true);
//     setUser(newUser);
//   }

  function handleChange(event: any) {
    const value = event.target.value;
    setInputValue(value);
  }

  async function handle2FAClick() {
    try {
      const response = await axios.post(
        `api/auth/verify2FA`,
        { token: inputValue },
        {
          headers: {
            Authorization: `Bearer ${jwt_token}`,
          },
        }
      );
      if (response.data.message === "2FA code is valid.") {
        handleTwo();
        navigateTo("/");
      } else if (response.data.message === "Invalid 2FA code.") {
        alert("Invalid input, please enter a valid input.");
        setInputValue("");
      }
    } catch (error) {
      console.error("Error verifying user 2FA", error);
      throw error;
    }
  }

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
      <br />
      Please enter your 6 digit-code that you can find on your authenticator
      application to enter the site
      <br />
      <input
        type="text"
        id="2FA"
        name="2FA"
        required
        minLength={6}
        maxLength={6}
        size={10}
        value={inputValue}
        onChange={handleChange}
      />
      <br />
      <label htmlFor="2FA">
        <Button
          color="secondary"
          variant="contained"
          size="large"
          component="span"
          onClick={handle2FAClick}
          sx={{ typography: { xs: "body2" } }}
        >
          Verify 2FA
        </Button>
      </label>
    </Box>
  );
}
