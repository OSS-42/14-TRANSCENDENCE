import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PrivateRoutes from './utils/PrivateRoutes'
import { useAuth } from './contexts/AuthContext'
import socketIO from 'socket.io-client'

import Header from './components/Header'
import { Chat, Home, Pong, Profile, Welcome, Error } from './pages'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <></>
  }

  if (!user) {
    return (
      <Router>
        <Welcome />
      </Router>
    )
  } else {
    const socket = socketIO("/chat", {
      query: { 
        token: user?.jwtToken,
      },
    })
    return (
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route element={<PrivateRoutes user={user} />}>
            <Route path="/chat" element={<Chat socket={socket} />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/game" element={<Pong />} />
            <Route path="*" element={<Error />} />
          </Route>
        </Routes>
      </Router>
    )
  }
}
export default App
