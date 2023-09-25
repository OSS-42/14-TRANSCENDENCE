import './index.scss'

import ReactDOM from 'react-dom/client'
import App from './App'
import axios from 'axios';
import theme from './styles/theme'
import { ThemeProvider } from '@mui/material/styles'
import { AuthProvider } from './contexts/AuthContext'
import { RoutesProvider } from './contexts/RoutesContext'
import { BrowserRouter as Router } from 'react-router-dom'
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 404) {
      // Effectuez la demande de rafraîchissement de token ici
      // Une fois le nouveau token obtenu, répétez la requête initiale
      // Assurez-vous de gérer correctement les erreurs de rafraîchissement
      // et les éventuelles tentatives répétées pour éviter une boucle infinie
    }
    return Promise.reject(error);
  }
);
root.render(
  //<React.StrictMode>
  <Router>
    <ThemeProvider theme={theme}>
      <RoutesProvider>
        <AuthProvider>
			<App/>
        </AuthProvider>
      </RoutesProvider>
    </ThemeProvider>
  </Router>
  //</React.StrictMode>
)

