import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import PrivateRoutes from "./utils/PrivateRoutes";
import { useAuth } from "./contexts/AuthContext";
import socketIO, { Socket } from "socket.io-client";

import Header from "./components/Header";
import { Chat, Home, Pong, Profile, Welcome, Error, Oops } from "./pages";
import { useEffect, useState } from "react";
import { DefaultEventsMap } from "@socket.io/component-emitter";

function App() {
  const { user, loading } = useAuth();
  const [chatSocket, setChatSocket] = useState<Socket<
    DefaultEventsMap,
    DefaultEventsMap
  > | null>(null);

  useEffect(() => {
    if (user) {
      const newSocket = socketIO("/chat", {
        query: {
          token: user.jwtToken,
        },
      });
      setChatSocket(newSocket);

      // Clean up the socket connection when unmounting or if the user logs out.
      return () => {
        newSocket.disconnect();
      };
    }
    return undefined;
  }, [user]);

  if (loading) {
    return <></>;
  }

  return (
    <Router>
      {user ? <Header /> : null}
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/oops" element={<Oops />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/game" element={<Pong />} />
        <Route path="*" element={<Error />} />

        {/* Place the Home route here to ensure it's always rendered */}
        <Route path="/" element={<Home />} />

        {user && chatSocket !== null && (
          <Route path="/chat" element={<Chat socket={chatSocket} />} />
        )}
      </Routes>

      {/* Redirect to Welcome if user is not authenticated */}
      {!user && <Navigate to="/welcome" />}
    </Router>
  );
}

export default App;
