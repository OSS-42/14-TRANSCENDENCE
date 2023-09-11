import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../contexts/AuthContext";
import { Tab, Tabs } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // Use useNavigate instead of history
  const [activeTab, setActiveTab] = useState(0);

  const handleLogout = () => {
    logout();
    // Navigate to the desired route after logout
    navigate("/"); // Replace '/' with the route you want to navigate to after logout
  };

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
    switch (newValue) {
      case 0:
        navigate("/chat"); // Use navigate to go to the desired route
        break;
      case 1:
        navigate("/game");
        break;
      case 2:
        navigate("/profile");
        break;
      default:
        break;
    }
  };

  return (
    <div className="header">
      <header>
        <div className="links-wrapper">
          {user ? (
            <nav>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => handleTabChange(newValue)} // Pass newValue to handleTabChange
                aria-label="navigation tabs"
              >
                <Tab sx={{ color: "#c9c9c5" }} label="Chat" />
                <Tab sx={{ color: "#c9c9c5" }} label="Pong" />
                <Tab sx={{ color: "#c9c9c5" }} label="Profile" />
              </Tabs>
              <IconButton
                sx={{ color: "#f9d271" }}
                aria-label="delete"
                onClick={handleLogout}
              >
                <LogoutIcon />
              </IconButton>
            </nav>
          ) : (
            <></>
          )}
        </div>
      </header>
    </div>
  );
};

export default Header;
