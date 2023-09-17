import { useEffect, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../contexts/AuthContext'
import { Tab, Tabs } from '@mui/material'
import { useRoutes } from '../contexts/RoutesContext'

const Header = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState(0)
  const { navigateTo } = useRoutes()

  useEffect(() => {
    const savedActiveTab = localStorage.getItem('activeTab')
    if (savedActiveTab) {
      setActiveTab(parseInt(savedActiveTab))
    }
  }, [])


  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue)
    localStorage.setItem('activeTab', newValue.toString())
    switch (newValue) {
      case 0:
        navigateTo('/') // Use navigate to go to the desired route
        break
      case 1:
        navigateTo('/chat') // Use navigate to go to the desired route
        break
      case 2:
        navigateTo('/game')
        break
      case 3:
        navigateTo('/profile')
        break
      default:
        break
    }
  }

  return (
    <div id="navbar" className="header">
      <header>
        <div className="links-wrapper">
          {user ? (
            <nav>
              <Tabs
                value={activeTab}
                // onChange={(_, newValue) => handleTabChange(newValue)}
                aria-label="navigation tabs"
              >
                <Tab label="Home" />
                <Tab label="Chat" />
                <Tab label="Pong" />
                <Tab label="Profile" />
                <IconButton
                  color="info"
                  aria-label="logout"
                  onClick={logout}
                >
                  <LogoutIcon />
                </IconButton>
              </Tabs>
            </nav>
          ) : (
            <></>
          )}
        </div>
      </header>
    </div>
  )
}

export default Header
