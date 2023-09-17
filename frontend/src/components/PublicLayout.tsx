import { Navigate, useOutlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import React from 'react'
import Header from './Header'
import { Welcome } from '../pages'

export const PublicLayout = () => {
  const { user } = useAuth()
  const outlet = useOutlet()

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Welcome />
}
