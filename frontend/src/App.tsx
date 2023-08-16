import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Chat, Home, Pong, Profile, Welcome } from "./pages";

function App() {
  const user = true;

  return (
    <Routes>
      <Route path="/" element={!user ? <Welcome /> : <Home />} />
      <Route path="/chat" element={!user ? <Welcome /> : <Chat />} />
      <Route path="/game" element={!user ? <Welcome /> : <Pong />} />
      <Route path="/profile" element={!user ? <Welcome /> : <Profile />} />
    </Routes>
  );
}

//the state of a logged user is hard coded right now, by setting [user] to true or false.
//this will be changed to integrate state hooks and the logic behind login validation.
//the idea of creating protected routes is to be implemented. check it here:
// https://www.makeuseof.com/create-protected-route-in-react/
// feel free to change the routes, Momo!

export default App;
