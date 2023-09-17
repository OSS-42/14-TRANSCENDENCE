import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Welcome } from '../pages'

export const PublicLayout = () => {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Welcome />
}

/*THIS WILL PROBABLY BE DELETED! Please ignore.*/