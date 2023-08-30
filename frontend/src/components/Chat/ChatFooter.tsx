import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import axios from "axios";
import Cookies from "js-cookie";
import joinCommand from "./commands/joinCommand";
import defaultCommand from "./commands/defaultCommand";
import privmsgCommand from "./commands/privmsgCommand";
import inviteCommand from "./commands/inviteCommand";
import muteCommand from "./commands/muteCommand";
import adminCommand from "./commands/adminCommand";

type ChatFooterProps = {
  socket: Socket; // Assurez-vous que ce type correspond au type de socket que vous utilisez
};

interface User {
  id: Number;
  username: string;
  avatar: string;
  mail: string;
}


// Voir avec Sam : est-ce que je n'ai pas deja le userId et le socketId grace a l'objet User et socket ?
const ChatFooter = ({ socket }: ChatFooterProps) => {
  const [data, setData] = useState("");
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
    if (data.trim()) {
      if (data.startsWith("#JOIN"))
        joinCommand({ data, socket, user });
      else if (data.startsWith("#PRIVMSG"))
        privmsgCommand({ data, socket, user });
      else if (data.startsWith("#INVITE"))
        inviteCommand({ data, socket, user });
      else if (data.startsWith("#MUTE"))
        muteCommand({ data, socket, user });
      else if (data.startsWith("#ADMIN"))
        adminCommand({ data, socket, user });
      // else if (message.startsWith("#KICK"))
      //   kickCommand({ message, socket, user });
      // else if (message.startsWith("#BAN"))
      //   banCommand({ message, socket, user });
      // else if (message.startsWith("#LEAVE")) Moins sur de la commande leave
      //   joinCommand({ message, socket, user });
      else
        defaultCommand({ data, socket, user });
    }
    setData("");
  };

  return (
    <div className="chat__footer">
      <form className="form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Write message"
          className="message"
          value={data}
          onChange={(e) => setData(e.target.value)} // C'est ici que la variable data est remplie
        />
        <button className="sendBtn">SEND</button>
      </form>
    </div>
  );
};

export default ChatFooter;
