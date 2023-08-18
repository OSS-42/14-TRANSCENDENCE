import { createTheme } from '@mui/material/styles'
import { colors } from './colors'

const theme = createTheme({
  palette: {
    primary: {
      main: '#005678',
    },
    secondary: {
      main: '#ff2a6d',
    },
    background: {
      default: '#f9fcff',
      paper: '#e4f7fb',
    },
    text: {
      primary: '#01012b',
    },
    error: {
      main: '#bd0b12',
    },
    warning: {
      main: '#f7c948',
    },
    info: {
      main: '#05d9e8',
    },
    success: {
      main: '#05d9e8',
    },
  },
  shape: {
    borderRadius: 4,
  },
})

export default theme
