import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from 'react-router-dom'

import RootLayout from './layouts/RootLayout'
import { Chat, Home, Login, Pong, Profile, Welcome, Error } from './pages'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="chat" element={<Chat />} />
      <Route path="game" element={<Pong />} />
      <Route path="profile" element={<Profile />} />
      <Route path="welcome" element={<Welcome />} />
      <Route path="*" element={<Error />} />
    </Route>
  )
)

function App() {
  return <RouterProvider router={router} />
}

export default App;
