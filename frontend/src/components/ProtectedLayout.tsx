import { Navigate, useOutlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import React from 'react'
import Header from './Header'
import { Welcome } from '../pages'

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
