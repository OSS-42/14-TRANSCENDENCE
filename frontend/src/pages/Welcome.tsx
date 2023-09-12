import { Box, Button, Typography } from '@mui/material'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Welcome() {
  const { login } = useAuth()

  return (
    <Box component="div" id="welcome-page" style={{ background: '#000' }}>
      <Typography
        sx={{
          textAlign: 'center',
          color: '#fde5c5',
          fontSize: '1.2rem',
          '@media (min-width:600px)': {
            fontSize: '1.5rem',
          },
        }}
      >
        Welcome
        <br />
        to PONG!
      </Typography>
      <Box component="div" id="arcade" sx={{ marginBottom: '5rem' }}>
        <img width="100%" src="arcade.png" alt="" />
      </Box>
      <NavLink to="/api/auth/42">
        <Button size="small" variant="contained" onClick={login}>
          LOG IN
        </Button>
      </NavLink>
    </Box>
  )
}
