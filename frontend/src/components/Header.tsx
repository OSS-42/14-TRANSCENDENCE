import { useEffect, useState } from 'react'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../contexts/AuthContext'
import { Box, Tab, Tabs } from '@mui/material'
import { useRoutes } from '../contexts/RoutesContext'

const Header = () => {
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const { navigateTo } = useRoutes()

  useEffect(() => {
    const savedActiveTab = localStorage.getItem('activeTab')
    if (savedActiveTab) {
      const value = parseInt(savedActiveTab)
      if (value == 4) setActiveTab(0)
      else setActiveTab(value)
    }
  }, [])

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue)
    localStorage.setItem('activeTab', newValue.toString())
    switch (newValue) {
      case 0:
        navigateTo('/')
        break
      case 1:
        navigateTo('/chat')
        break
      case 2:
        navigateTo('/game')
        break
      case 3:
        navigateTo('/profile')
        break
      case 4:
        logout()
        break
      default:
        break
    }
  }

  return (
    <Box component="div" id="navbar" className="header" sx={{ width: '100%' }}>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => handleTabChange(newValue)}
        aria-label="navigation tabs"
        textColor="secondary"
        indicatorColor="secondary"
      >
        <Tab label="Home" />
        <Tab label="Chat" />
        <Tab label="Pong" />
        <Tab label="Profile" />
        <Tab icon={<LogoutIcon />} />
      </Tabs>
    </Box>
  )
}

export default Header
