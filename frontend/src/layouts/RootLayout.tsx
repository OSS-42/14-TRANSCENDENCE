import { NavLink, Outlet } from 'react-router-dom'
import { Welcome } from '../pages'

// I'd like to change the header for a Material UI component,
// but I'm still not sure how it would work.
// For now we have a simple NavBar. :)

export default function RootLayout() {
  const user = true

  if (!user) {
    return <Welcome />
  }

  return (
    <div className="root-layout">
      <header>
        <nav>
          <NavLink to="chat">Chat</NavLink>
          <NavLink to="game">Pong</NavLink>
          <NavLink to="profile">Profile</NavLink>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

// the state of a logged user is hard coded right now, by setting [user] to true or false.
// this will be changed to integrate hooks and the logic behind login validation. (connection to API)
// the idea of creating protected routes is to be implemented. check it here:
// https://www.makeuseof.com/create-protected-route-in-react/
// feel free to change the routes!
