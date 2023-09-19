import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
// import PrivateRoutes from "./utils/PrivateRoutes";
import { useAuth } from './contexts/AuthContext'
import socketIO, { Socket } from 'socket.io-client'

import Header from './components/Header'
import { Chat, Home, Pong, Profile, Welcome, Error, Oops } from './pages'
import { useEffect, useState } from 'react'

function App() {
  const { user, loading } = useAuth()
  const [chatSocket, setChatSocket] = useState<Socket | null>(null)
  const [chatSocketInitialized, setChatSocketInitialized] = useState(false)

  useEffect(() => {
    if (!user) return

    const newSocket = socketIO('/chat', {
      query: {
        token: user?.jwtToken,
      },
    })
    newSocket.on('connect', () => {
      setChatSocketInitialized(true)
      setChatSocket(newSocket)
      console.log('ChatSocket Connection made!')
    })
    return () => {
      newSocket.disconnect()
    }
  }, [user])

  if (loading) {
    console.log('Loading...')
    return <></>
  }

  return (
    <>
      {user ? <Header /> : null}
      <Routes>
        <Route
          path="/welcome"
          element={user ? <Navigate to="/" /> : <Welcome />}
        />
        <Route
          path="/"
          element={user ? <Home /> : <Navigate to="/welcome" />}
        />
        <Route
          path="/chat"
          element={
            user && chatSocket ? (
              <Chat socket={chatSocket} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="/game" element={user ? <Pong /> : <Navigate to="/" />} />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/" />}
        />
        <Route
          path="/profile/:username"
          element={user ? <Profile /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Error />} />
      </Routes>
    </>
  )
}

export default App
