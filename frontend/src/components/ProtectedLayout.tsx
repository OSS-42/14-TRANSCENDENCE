import { useOutlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from './Header'

export const ProtectedLayout = () => {
  const { user, logout } = useAuth()
  const outlet = useOutlet()

  if (!user) {
    logout()
  }

  return (
    <>
      <Header />
      {outlet}
    </>
  )
}

/*THIS WILL PROBABLY BE DELETED! Please ignore. */
