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
import kickCommand from "./commands/kickCommand";
import banCommand from "./commands/banCommand";
import blockCommand from "./commands/blockCommand";
import modeCommand from "./commands/modeCommand";

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
		const response = await axios.get("/api/users/me", {
		  headers: {
			Authorization: "Bearer " + jwt_token,
		  },
		});
		setUser(response.data);
	  } catch (error) {
		console.error("Error fetching user data:", error);
	  }
	}
  
	fetchUsersData();
  }, []);
  
  // Use another useEffect to log the updated user state
  useEffect(() => {
	console.log(user);
  }, [user]);

  const handleSendMessage = (e: React.FormEvent) => { //e pour evenement, c'est une convention
    e.preventDefault();
    if (data.trim()) {
      if (data.startsWith("/JOIN"))
        joinCommand({ data, socket, user });
      else if (data.startsWith("/PRIVMSG"))
        privmsgCommand({ data, socket, user });
      else if (data.startsWith("/INVITE"))
        inviteCommand({ data, socket, user });
      else if (data.startsWith("/MUTE"))
        muteCommand({ data, socket, user });
      else if (data.startsWith("/ADMIN"))
        adminCommand({ data, socket, user });
      else if (data.startsWith("/KICK"))
        kickCommand({ data, socket, user });
      else if (data.startsWith("/BAN"))
        banCommand({ data, socket, user });
      else if (data.startsWith("/BLOCK"))
        blockCommand({ data, socket, user });
      else if (data.startsWith("/MODE"))
        modeCommand({ data, socket, user });
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
