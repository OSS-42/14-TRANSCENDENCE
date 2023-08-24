import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import axios from "axios";
import Cookies from "js-cookie";
import joinCommand from "./commands/joinCommand";
import defaultCommand from "./commands/defaultCommand";
import privmsgCommand from "./commands/privmsgCommand";

type ChatFooterProps = {
  socket: Socket; // Assurez-vous que ce type correspond au type de socket que vous utilisez
};

interface User {
  id: Number;
  username: string;
  avatar: string;
  mail: string;
}

const ChatFooter = ({ socket }: ChatFooterProps) => {
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User>({
    id: 0,
    username: "",
    avatar: "",
    mail: "",
  });

  useEffect(() => {
    async function fetchUsersData() {
      const jwt_token = Cookies.get("jwt_token");
      try {
        const response = await axios.get("http://localhost:3001/users/me", {
          headers: {
            Authorization: "Bearer " + jwt_token,
          },
        });
        // setUsersList(response.data)
        setUser(response.data);
        console.log(user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUsersData();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => { //e pour evenement, c'est une convention
    e.preventDefault();
    if (message.trim()) {
      if (message.startsWith("#JOIN"))
        joinCommand({ message, socket, user });
      else if (message.startsWith("#PRIVMSG"))
        privmsgCommand({ message, socket, user });
      // else if (message.startsWith("#KICK"))
      //   kickCommand({ message, socket, user });
      // else if (message.startsWith("#BAN"))
      //   banCommand({ message, socket, user });
      // else if (message.startsWith("#ADMIN"))
      //   adminCommand({ message, socket, user });
      // else if (message.startsWith("#LEAVE")) Moins sur de la commande leave
      //   joinCommand({ message, socket, user });
      else
        defaultCommand({ message, socket, user });
    }
    setMessage("");
  };

  return (
    <div className="chat__footer">
      <form className="form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Write message"
          className="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="sendBtn">SEND</button>
      </form>
    </div>
  );
};

export default ChatFooter;
