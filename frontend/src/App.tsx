import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoutes from "./utils/PrivateRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import socketIO from "socket.io-client";

import { getCookies } from "./utils";
import Header from "./components/Header";
import { Chat, Home, Pong, Profile, Welcome, Error } from "./pages";
//On va surement faire un autre  websocket pour le pong.

function App() {
  const jwtToken = getCookies("jwt_token");

  const socket = socketIO("http://localhost:3001/chat", {
    query: {
      token: jwtToken,
    },
  });

  if (!jwtToken) {
    console.log("No jwtToken!");

    return (
      <>
        <Router>
          <Welcome />
        </Router>
      </>
    );
  } else {
    console.log(`Loading with jwtToken: ${jwtToken}`);
    return (
      <Router>
        <AuthProvider token={jwtToken}>
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
        </AuthProvider>
      </Router>
    );
  }
}
export default App;
