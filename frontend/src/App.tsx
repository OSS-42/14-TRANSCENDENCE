import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import socketIO, { Socket } from "socket.io-client";

import Header from "./components/Header";
import {
  Chat,
  Home,
  Pong,
  MyProfile,
  UserProfile,
  Welcome,
  Error
} from "./pages";
import { useEffect, useState } from "react";
import { TwoFactor } from "./pages/TwoFactor";

function App() {
  const { user, loading, isLogged } = useAuth();
  const [chatSocket, setChatSocket] = useState<Socket | null>(null);
  const [chatSocketInitialized, setChatSocketInitialized] = useState(false);

  useEffect(() => {
    if (!user) return;

    if (user && chatSocketInitialized) return;

    const newSocket = socketIO("/chat", {
      query: {
        token: user?.jwtToken,
      },
    });
    newSocket.on("connect", () => {
      setChatSocketInitialized(true);
      setChatSocket(newSocket);
      console.log("ChatSocket Connection made!");
    });
    return () => {
      newSocket.disconnect();
    };
  }, [isLogged]);

  if (loading) {
    console.log("Loading...");
    return <></>;
  }

  return (
    <>
      <>
        {(user && user.is2FAValidated) || (user && !user.is2FA) ? (
          <Header />
        ) : null}
        <Routes>
          <Route
            path="/welcome"
            element={user ? <Navigate to="/" /> : <Welcome />}
          />
          <Route
            path="/"
            element={user ? <Home /> : <Navigate to="/welcome" />}
          />
          <Route
            path="/chat"
            element={
              user && chatSocket ? (
                <Chat socket={chatSocket} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="/game" element={user ? <Pong /> : <Navigate to="/" />} />
          <Route
            path="/TwoFactor"
            element={user ? <TwoFactor /> : <Navigate to="/welcome" />}
          />
          <Route
            path="/profile"
            element={user ? <MyProfile /> : <Navigate to="/" />}
          />
          <Route
            path="/profile/:username"
            element={user ? <UserProfile /> : <Navigate to="/" />}
          />
          <Route path="*" element={<Error />} />
        </Routes>
      </>
    </>
  );
}

export default App;
