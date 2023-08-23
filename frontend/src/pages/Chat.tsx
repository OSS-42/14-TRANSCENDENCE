import { Box, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import ChatBar from "../components/Chat/ChatBar";
import ChatBody from "../components/Chat/ChatBody";
import ChatFooter from "../components/Chat/ChatFooter";

// I'll refactor this, but the componenets placement would still be
// where the simple texts are. As it is, I'm not yet confident the
// layout is gonna be responsive to the components' size, etc.
// I'm still not sure how everything interacts, but I'll find out soon enough.

type ChatMessage = {
  id: number; // un identifiant unique pour chaque message
  name: string;
  text: string;
};

type ChatProps = {
  socket: Socket;
};

export function Chat({ socket }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // useEffect peut être utilisé pour s'abonner à des flux et mettre à jour l'état du
  // composant lorsque de nouvelles données sont disponibles.
  useEffect(() => {
    socket.on(
      "messageResponse",
      (data: ChatMessage) => setMessages([...messages, data]) //Cette partie met à jour l'état messages. Elle utilise le spread operator ... pour créer un nouveau tableau qui contient les anciens messages (messages) ainsi que le nouveau message data. Ensuite, elle appelle setMessages pour mettre à jour la valeur de messages avec ce nouveau tableau.
    );
  }, [socket, messages]); // Le contenu du tableau signifie qu'il y a des dépendances, donc cet effet se déclenche a chaque fois que le statut d'une des variables change.
  
  // socket.emit('allo'); //Pourquoi j'ai deux message dans le console du serveur ?
  // socket.on('allo', () => {
  //   alert('allo');
  // })
  
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
          }}
        >
          <ChatBody messages={messages} />
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
          }}
        >
          <ChatBar someProp={socket}/>
          {/* I'm a box for the friends list. Replace this line with a component. */}
        </Box>
        <Box
          sx={{
            border: "1px solid black",
            borderRadius: "4px",
            padding: "1rem",
          }}
        >
          I'm a box for the friends list. Replace this line with a component.
        </Box>
      </Box>
    </Box>
  );
}
