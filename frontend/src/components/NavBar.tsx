import * as React from 'react'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import { Chat, Home, Login, Pong, Profile, Welcome } from '../pages'

import {
  MemoryRouter,
  Route,
  Routes,
  Link,
  matchPath,
  useLocation,
} from 'react-router-dom'
import { StaticRouter } from 'react-router-dom/server'

function Router(props: { children?: React.ReactNode }) {
  const { children } = props
  if (typeof window === 'undefined') {
    return <StaticRouter location="/drafts">{children}</StaticRouter>
  }

  return (
    <MemoryRouter initialEntries={['/drafts']} initialIndex={0}>
      {children}
    </MemoryRouter>
  )
}

function useRouteMatch(patterns: readonly string[]) {
  const { pathname } = useLocation()

  for (let i = 0; i < patterns.length; i += 1) {
    const pattern = patterns[i]
    const possibleMatch = matchPath(pattern, pathname)
    if (possibleMatch !== null) {
      return possibleMatch
    }
  }

  return null
}

function MyTabs() {
  // You need to provide the routes in descendant order.
  // This means that if you have nested routes like:
  // users, users/new, users/edit.
  // Then the order should be ['users/add', 'users/edit', 'users'].
  const routeMatch = useRouteMatch(['/inbox/:id', '/drafts', '/trash'])
  const currentTab = routeMatch?.pattern?.path

  return (
    <Tabs value={currentTab}>
      <Tab label="Game" value="/game" to="/game" component={Link} />
      <Tab label="Chat" value="/chat" to="/chat" component={Link} />
      <Tab label="Profile" value="/profile" to="/profile" component={Link} />
    </Tabs>
  )
}

function CurrentRoute() {
  const location = useLocation()

  return (
    <Typography variant="body2" sx={{ pb: 2 }} color="text.secondary">
      Current route: {location.pathname}
    </Typography>
  )
}

export default function NavBar() {
  return (
    <Router>
      <Box sx={{ width: '100%' }}>
        <Routes>
          <Route path="/" element={<Pong />} />
          <Route path="login" element={<Login />} />
          <Route path="chat" element={<Chat />} />
          <Route path="game" element={<Pong />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
        <MyTabs />
      </Box>
    </Router>
  )
}
