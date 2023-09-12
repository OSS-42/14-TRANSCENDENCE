import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  typography: {
    fontFamily: 'Montserrat, Press Start 2P, sans-serif',
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
