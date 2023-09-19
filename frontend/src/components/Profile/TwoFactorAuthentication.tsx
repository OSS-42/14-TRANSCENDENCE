import { Box, Button, Modal, TextField, Typography } from '@mui/material'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode.react'

const BASE_URL = '/api'

export function TwoFactorAuthentication() {
  const [otpURL, setOtpURL] = useState('')
  const [isQRCodeVisible, setQRCodeVisible] = useState(false)
  const [isActivated, setIsActivated] = useState('')
  const jwt_token = Cookies.get('jwt_token')

  async function activate2FA() {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/enable2FA`,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwt_token}`,
          },
        }
      )
      setOtpURL(response.data.otpauthUrl)
      console.log(response.data.otpauthUrl)
      setQRCodeVisible(true)
    } catch (error) {
      console.error('Error fetching user 2FA', error)
      throw error
    }
  }

  async function deactivate2FA() {
    try {
      const response = await axios.post(
        `${BASE_URL}/auth/disable2FA`,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwt_token}`,
          },
        }
      )
      alert(response.data.message)
      setOtpURL('')
      setQRCodeVisible(false)
    } catch (error) {
      console.error('Error disabling user 2FA', error)
      throw error
    }
  }

  function handle2FA() {
    if (isActivated) {
      setIsActivated(false)
      deactivate2FA()
    } else {
      activate2FA()
      setIsActivated(true)
    }
  }

  return (
    <Box
      component="div"
      sx={{
        borderRadius: '5px',
        margin: '0 0 2rem 0',
        width: '100%',
        display: 'flex',
        justifyContent: 'center', // Center horizontally
        alignItems: 'center', // Center vertically
      }}
    >
      <label>
        <Button
          variant="contained"
          size="small"
          component="span"
          onClick={handle2FA}
          sx={{ typography: { xs: 'body2' } }}
        >
          {isActivated ? 'Deactivate 2FA' : 'Activate 2FA'}
        </Button>
        <Modal open={isQRCodeVisible} onClose={() => setQRCodeVisible(false)}>
          <Box
            component="div"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'white',
              border: '2px solid #000',
              textAlign: 'center',
              borderRadius: '5px',
              p: 2,
            }}
          >
            <Typography variant="h5">Set up 2FA</Typography>
            <br />
            <Typography>Follow the instructions below:</Typography>
            <br />
            <QRCode value={otpURL} size={256} />
            <Typography>
              <br /> Scan the QR code with your authenticator app.
            </Typography>
          </Box>
        </Modal>
      </label>
    </Box>
  )
}
