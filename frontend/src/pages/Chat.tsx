import { Box, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import ChatBar from "../components/Chat/ChatBar";
import ChatBody from "../components/Chat/ChatBody";
import ChatFooter from "../components/Chat/ChatFooter";
import ChatFriends from "../components/Chat/ChatFriends";

// I'll refactor this, but the componenets placement would still be
// where the simple texts are. As it is, I'm not yet confident the
// layout is gonna be responsive to the components' size, etc.
// I'm still not sure how everything interacts, but I'll find out soon enough.

type ChatMessage = {
  id: number; // un identifiant unique pour chaque message
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
  // useEffect peut être utilisé pour s'abonner à des flux et mettre à jour l'état du
  // composant lorsque de nouvelles données sont disponibles.
  useEffect(() => {
	socket.on("messageResponse", (data: ChatMessage) => 
	  setMessages(prevMessages => [...prevMessages, data])
	);
	socket.on("notice", (data: ChatMessage) => {
	  setMessages(prevMessages => [...prevMessages, data])
	});
  
	return () => {
	  socket.off("messageResponse");
	  socket.off("notice");
	};
  }, [socket]);
  
  return (
    // main box
    <Box
      sx={{
        display: "flex",
        padding: "10px",
        height: "92.5vh",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateRows: "11fr .5fr",
          width: "70%",
          padding: "2rem",
          border: "1px solid black",
          gap: "10px",
        }}
      >
        {/* Chat Box */}
        <Box
          sx={{
            border: "1px solid black",
            borderRadius: "4px",
            padding: "1rem",
            overflow: "auto"
          }}
        >
          <ChatBody messages={messages}/>
          {/* I'm a chat room box for the messages received. Replace this line with
          a component. */}
        </Box>
        <ChatFooter socket={socket} />
        {/* <TextField
          id="outlined-basic"
          label="Type your message..."
          variant="outlined"
        /> */}
      </Box>
      {/* Lists Box */}
      <Box
        sx={{
          display: "grid",
          gridTemplateRows: "8fr 4fr",
          width: "30%",
          padding: "2rem",
          border: "1px solid black",
          gap: "10px",
        }}
      >
        <Box
          sx={{
            border: "1px solid black",
            borderRadius: "4px",
            padding: "1rem",
            overflow: "auto"
          }}
        >
          <ChatBar socket={socket}/>
          {/* I'm a box for the friends list. Replace this line with a component. */}
        </Box>
        <Box
          sx={{
            border: "1px solid black",
            borderRadius: "4px",
            padding: "1rem",
            overflow: "auto"
          }}
        >
          <ChatFriends socket={socket}/>
        </Box>
      </Box>
    </Box>
  );
}


/*
  Pour le channel on a besoin :
  - Son nom
  - Son proprietaire
  - Ses admins
  - Ses membres
  - Qui est ban
  - Flag de mdp
  - mdp
  - Flag invitation ? 
  - 

  Pour les utilisateurs : 
  - Son nom
  - Ses channels
  - Ses amis
  - Les personnes qu'il a bloqué
*/