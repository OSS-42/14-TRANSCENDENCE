import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  typography: {
    fontFamily: 'Press Start 2P, sans-serif',
    body1: {
      fontSize: 6,
    },
    body2: {
      fontSize: 8,
    },
    h6: {
      fontSize: 12,
    },
    h5: {
      fontSize: 16,
    },
    h4: {
      fontSize: 24,
    },
    h3: {
      fontSize: 28,
    },
    h2: {
      fontSize: 32,
    },
    h1: {
      fontSize: 36,
    },
  },
  palette: {
    primary: {
      main: '#120d23',
      contrastText: '#fdf6ff',
    },
    secondary: {
      main: '#ffb63d',
    },
    background: {
      default: '#090609',
      paper: '#3d3242',
    },
    text: {
      primary: '#f9f3ff',
      secondary: '#c96069',
      disabled: '#8c808c',
    },
    error: {
      main: '#d41724',
    },
    info: {
      main: '#d9eef3',
    },
    success: {
      main: '#909e66',
    },
    warning: {
      main: '#ffb63d',
    },
  },
  shape: {
    borderRadius: 4,
  },
})

export default theme
