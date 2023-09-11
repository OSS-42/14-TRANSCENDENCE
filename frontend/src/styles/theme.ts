import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#fdb863',
    },
    secondary: {
      main: '#A95D6B',
    },
    background: {
      default: '#a95d6b',
      paper: '#c6c5c8',
    },
    text: {
      primary: '#c9c9c5',
    },
    error: {
      main: '#FDB863',
    },
    warning: {
      main: '#f9d271',
    },
    info: {
      main: '#fdb863',
    },
    success: {
      main: '#a95d6b',
    },
  },
  shape: {
    borderRadius: 4,
  },
})

export default theme
