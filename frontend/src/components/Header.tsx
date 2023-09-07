import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// I'd like to change the header for a Material UI component,
// but I'm still not sure how it would work.
// For now we have a simple NavBar. :)

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="header">
      <header>
        <div className="links-wrapper">
          {user ? (
            <nav>
              <NavLink to="chat">Chat</NavLink>
              <NavLink to="game">Pong</NavLink>
              <NavLink to="profile">Profile</NavLink>
              <IconButton aria-label="delete" onClick={handleLogout}>
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
