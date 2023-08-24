import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import axios from "axios";
import Cookies from "js-cookie";

type ChatFooterProps = {
  socket: Socket; // Assurez-vous que ce type correspond au type de socket que vous utilisez
};

interface User {
  id: Number;
  username: string;
  // gamesWon Int
  avatar: string;
  mail: string;
}

const ChatFooter = ({ socket }: ChatFooterProps) => {
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User>();

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

  const handleSendMessage = (e) => {
    e.preventDefault();
    // console.log(message);
    // console.log(user?.username);
    if (message.trim()) {
      if (message.startsWith("#JOIN")) {
        const [, channelName] = message.split(" ");
        if (channelName) {
          // Format du message pour le serveur
          console.log(channelName);
          socket.emit("joinRoom", {
            username: user?.username,
            id: `${socket.id}${Math.random()}`,
            socketID: socket.id,
            name: channelName
          });
          console.log(channelName);
        }
      } else {
          socket.emit("message", {
          text: message,
          name: user?.username,
          id: `${socket.id}${Math.random()}`,
          socketID: socket.id,
        }); // J'emit plusieurs informations, pas seulement le message
      }
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
