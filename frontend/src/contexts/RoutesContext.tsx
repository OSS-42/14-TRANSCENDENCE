import React, { createContext, ReactNode, useContext } from 'react'

import { useNavigate } from "react-router-dom";

interface RoutesContextType {
  navigateTo: (path: string) => void
}

const RoutesContext = createContext<RoutesContextType | undefined>(undefined)

interface RoutesProviderProps {
  children: ReactNode
}

export function RoutesProvider({ children }: RoutesProviderProps) {
  const navigateTo = (path: string) => {
    const navigate = useNavigate();
    console.log('Navigating to:', path)
		navigate(path)
  }

  return (
    <RoutesContext.Provider value={{ navigateTo }}>
      {children}
    </RoutesContext.Provider>
  )
}

export function useRoutes() {
  const context = useContext(RoutesContext)
  if (!context) {
    throw new Error('useRoutes must be used within a RoutesProvider')
  }
  return context
}
