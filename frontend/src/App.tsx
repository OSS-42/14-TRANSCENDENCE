import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoutes from "./utils/PrivateRoutes";
import { useAuth } from "./contexts/AuthContext";
import socketIO from "socket.io-client";

import Header from "./components/Header";
import { Chat, Home, Pong, Profile, Welcome, Error } from "./pages";
//On va surement faire un autre  websocket pour le pong.

function App() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Router>
        <Welcome />
      </Router>
    );
  } else {
    const socket = socketIO("/chat", {
      query: {
        token: user?.jwtToken,
      },
    });
    return (
      <Router>
        <Header />
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route path="/" element={<Home />} />
            <Route path="/welcome" element={<Home />} />
            <Route path="/chat" element={<Chat socket={socket} />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/game" element={<Pong />} />
            <Route path="*" element={<Error />} />
          </Route>
        </Routes>
      </Router>
    );
  }
}
export default App;
