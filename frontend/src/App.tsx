import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoutes from "./utils/PrivateRoutes";
import { AuthProvider } from "./utils/AuthContext";

import socketIO from "socket.io-client";
import Cookies from "js-cookie";

import Header from "./components/Header";
import { Chat, Home, Pong, Profile, Welcome, Error } from "./pages";

//On va surement faire un autre  websocket pour le pong.
const socket = socketIO("http://localhost:3001/chat", {
  query: {
    token: Cookies.get("jwt_token"),
  },
});

function App() {
  return (
    <Router>
      <AuthProvider> 
        <Header />
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route element={<PrivateRoutes />}>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat socket={socket} />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/game" element={<Pong />} />
            <Route path="*" element={<Error />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
