import { Box, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import ChatBar from "../components/Chat/ChatBar";
import ChatBody from "../components/Chat/ChatBody";
import ChatFooter from "../components/Chat/ChatFooter";
import ChatFriends from "../components/Chat/ChatFriends";
import { FriendsAndUsers } from "../components/Chat/FriendsAndUsers";
import { User } from "../models/User";

// I'll refactor this, but the componenets placement would still be
// where the simple texts are. As it is, I'm not yet confident the
// layout is gonna be responsive to the components' size, etc.
// I'm still not sure how everything interacts, but I'll find out soon enough.
// Il y une facon de garder l'historique du chat on refresh, avec le local storage. EZCLAP voir le video discord
type ChatMessage = {
  id: number;
  name: string;
  channel: string;
  text: string;
  notice: string;
};

type ChatProps = {
  socket: Socket;
};

export function Chat({ socket }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const handleMessageResponse = (data: ChatMessage) => {
      setMessages(prevMessages => [...prevMessages, data]);
    };

    const handleNotice = (data: ChatMessage) => {
      setMessages(prevMessages => [...prevMessages, data]);
    };

    socket.on('messageResponse', handleMessageResponse);
    socket.on('notice', handleNotice);

    return () => {
      socket.off('messageResponse', handleMessageResponse);
      socket.off('notice', handleNotice);
    };
  }, [socket]);

  return (
    <Box
      sx={{
        display: 'flex',
        padding: '10px',
        height: '92.5vh',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: '11fr .5fr',
          width: '70%',
          padding: '2rem',
          border: '1px solid black',
          gap: '10px',
        }}
      >
        {/* Chat Box */}
        <Box
          sx={{
            border: '1px solid black',
            borderRadius: '4px',
            padding: '1rem',
            overflow: 'auto',
          }}
        >
          <ChatBody messages={messages} />
        </Box>
        <ChatFooter socket={socket} />
      </Box>
      {/* Lists Box */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: '8fr 4fr',
          width: '30%',
          padding: '2rem',
          border: '1px solid black',
          gap: '10px',
        }}
      >
        <Box
          sx={{
            border: '1px solid black',
            borderRadius: '4px',
            padding: '1rem',
            overflow: 'auto',
          }}
        >
          <FriendsAndUsers socket={socket} /> {/* Utilisez le composant combiné */}
        </Box>
      </Box>
    </Box>
  );
}