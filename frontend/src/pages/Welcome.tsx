import { Box, Button, Typography } from '@mui/material'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function Welcome() {
  const { user, login } = useAuth()

  if (!user) {
    return (
      <Box
        component="div"
        id="welcome-page"
        style={{ height: '50vh', background: '#000' }}
      >
        <Typography
          className="glitch"
          sx={{
            textAlign: 'center',
            '@media (min-width:600px)': {
              fontSize: '4rem',
            },
          }}
        >
          PONG
        </Typography>
        <Box component="div" id="arcade" sx={{ marginBottom: '5rem' }}>
          <img width="100%" src="arcade.png" alt="" />
        </Box>
        <Button
          href="/api/auth/42"
          size="small"
          variant="contained"
          onClick={login}
        >
          LOGIN
        </Button>
      </Box>
    )
  } else return <Navigate to="/" replace />
}
