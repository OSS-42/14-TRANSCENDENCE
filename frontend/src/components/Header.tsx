import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// I'd like to change the header for a Material UI component,
// but I'm still not sure how it would work.
// For now we have a simple NavBar. :)

const Header = () => {
  // const navigate = useNavigate();

  const { user } = useAuth();

  // const logoutClick = () => {
  //   //clear cookies and socket.off?
  //   navigate("/welcome");
  // };

  return (
    <div className="header">
      <header>
        <div className="links-wrapper">
          {user?.username ? (
            <nav>
              <NavLink to="chat">Chat</NavLink>
              <NavLink to="game">Pong</NavLink>
              <NavLink to="profile">Profile</NavLink>
            </nav>
          ) : null}
        </div>
      </header>
    </div>
  );
};

export default Header;