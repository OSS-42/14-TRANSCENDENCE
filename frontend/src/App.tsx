import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom'

import RootLayout from './layouts/RootLayout'
import socketIO from 'socket.io-client'
import Cookies from 'js-cookie'
import { Chat, Home, Login, Pong, Profile, Welcome, Error } from './pages'


const socket = socketIO('http://localhost:3001/chat', {
  query: {
    token: Cookies.get('jwt_token')
  },
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="chat" element={<Chat socket={socket} />} />
      <Route path="game" element={<Pong socket={socket} />} />
      <Route path="profile" element={<Profile />} />
      <Route path="welcome" element={<Welcome />} />
      <Route path="*" element={<Error />} />
    </Route>
  )
)

function App() {
  return <RouterProvider router={router} />
}

export default App
