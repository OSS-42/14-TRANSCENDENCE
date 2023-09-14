import { useEffect, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../contexts/AuthContext'
import { Tab, Tabs } from '@mui/material'
import { useNavigate } from 'react-router-dom' // Import useNavigate

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate() // Use useNavigate instead of history
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const savedActiveTab = localStorage.getItem('activeTab')
    if (savedActiveTab) {
      setActiveTab(parseInt(savedActiveTab))
    }
  }, [])

  const handleLogout = () => {
    logout()
    // Navigate to the desired route after logout
    navigate('/') // Replace '/' with the route you want to navigate to after logout
  }

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue)
    localStorage.setItem('activeTab', newValue.toString())
    switch (newValue) {
      case 0:
        navigate('/') // Use navigate to go to the desired route
        break
      case 1:
        navigate('/chat') // Use navigate to go to the desired route
        break
      case 2:
        navigate('/game')
        break
      case 3:
        navigate('/profile')
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
                onChange={(_, newValue) => handleTabChange(newValue)} // Pass newValue to handleTabChange
                aria-label="navigation tabs"
                textColor="secondary"
                indicatorColor="secondary"
              >
                <Tab sx={{ color: '#d9eef3' }} label="Home" />
                <Tab sx={{ color: '#d9eef3' }} label="Chat" />
                <Tab sx={{ color: '#d9eef3' }} label="Pong" />
                <Tab sx={{ color: '#d9eef3' }} label="Profile" />
                <IconButton
                  color="info"
                  aria-label="delete"
                  onClick={handleLogout}
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
