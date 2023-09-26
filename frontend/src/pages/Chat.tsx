import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import ChatBody from "../components/Chat/ChatBody";
import ChatFooter from "../components/Chat/ChatFooter";
import { FriendsAndUsers } from "../components/Chat/FriendsAndUsers";
import { getCookies } from "../utils";
import { useAuth } from "../contexts/AuthContext";

type ChatMessage = {
  userId: number;
  name: string;
  channel: string;
  text: string;
  notice: string;
  help: string;
};

type ChatProps = {
  socket?: Socket;
};

export function Chat({ socket }: ChatProps) {

  //la valeur de base de setMessage est prise dans le localStorage
  const { logout, tkn } = useAuth();
  const handleMessageResponse = (data: ChatMessage) => {
    console.log(data);
    setMessages((prevMessages) => [...prevMessages, data]);
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const localValues = localStorage.getItem("chatMessages");
    if (localValues == null) return [];
    return JSON.parse(localValues);
   

  });

  //QUand la variable messages change, on l<enregistre dans le localStorage
  useEffect(() => {
    const messagesJSON = JSON.stringify(messages);
    localStorage.setItem("chatMessages", messagesJSON);
    const jwtToken:string  =  getCookies("jwt_token");
    if(tkn !== jwtToken ){
      logout() 
    }
  }, [messages]);

  useEffect(() => {
    socket?.on("messageResponse", handleMessageResponse);
    socket?.on("notice", handleMessageResponse);

    return () => {
      socket?.off("messageResponse", handleMessageResponse);
      socket?.off("notice", handleMessageResponse);
    };
  }, [socket]);

  if (!socket || socket === undefined) {
    return <div>Loading...</div>; // or any other loading indicator or error message
  }

  return (
    <Box
      component="div"
      color="#ececec"
      sx={{
        backgroundColor: "#090609",
        borderRadius: "5px",
        display: "flex",
        marginTop: "3rem",
        height: "91%",
        width: "98.5%",
      }}
    >
      <Box
        component="div"
        sx={{
          display: "flex",
          flexGrow: 1,
          flexDirection: "column",
          margin: "1rem .5rem 1rem 1rem",
          maxWidth: "67%",
        }}
      >
        {/* Chat Box */}
        <Box
          id="boxscroll"
          component="div"
          sx={{
            flexGrow: 1,
            border: "1px solid #ffb63d",
            borderWidth: "1px 1px 0px 1px",
            borderRadius: "5px 5px 0 0",
            overflow: "auto",
          }}
        >
          <ChatBody messages={messages} socket={socket} />
        </Box>
        <ChatFooter socket={socket} />
      </Box>
      <Box
        id="boxscroll"
        component="div"
        sx={{
          minHeight: "90%",
          minWidth: "30%",
          margin: "1rem 1rem 1rem 0",
          borderRadius: "5px",
          padding: "1rem",
          border: "1px solid #ffb63d",
          overflow: "auto",
        }}
      >
        <FriendsAndUsers socket={socket} />
      </Box>
    </Box>
  );
}
