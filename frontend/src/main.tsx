import './index.scss'

import ReactDOM from 'react-dom/client'
import App from './App'

import theme from './styles/theme'
import { ThemeProvider } from '@mui/material/styles'
import { AuthProvider } from './contexts/AuthContext'
import { RoutesProvider } from './contexts/RoutesContext'
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  //<React.StrictMode>
  <ThemeProvider theme={theme}>
    <RoutesProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </RoutesProvider>
  </ThemeProvider>
  //</React.StrictMode>
)
