// import React from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { User } from "../../models/User";

type ChatMessage = {
  id: number; // un identifiant unique pour chaque message
  userId: number;
  name: string;
  channel: string;
  text: string;
  notice: string;
};

type ChatBodyProps = {
  messages: ChatMessage[];
  socket: Socket;
};

const ChatBody = ({ messages, socket }: ChatBodyProps) => {
  const [user, setUser] = useState<User>();
  const [banList, setBanList] = useState<number[]>();

  useEffect(() => {
    async function fetchUsersData() {
      const jwt_token = Cookies.get("jwt_token");
      try {
        const response = await axios.get("http://localhost:3001/users/me", {
          headers: {
            Authorization: "Bearer " + jwt_token,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      try {
        const banResponse = await axios.get(
          `http://localhost:3001/users/blockedUsers/${user.id}`,
          {
            // id du receveur
            headers: {
              Authorization: "Bearer " + jwt_token,
            },
          }
        );
        setBanList(banResponse.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUsersData();
  }, [messages]);
  return (
    <>
      <div className="message__container">
        {messages.map((message) => (
          <div className="message__chats" key={message.id}>
            <p>
              {message.notice ? (
                // Si message.notice n'est pas nulle, affichez son contenu.
                <span className="notice">{message.notice}</span>
              ) : (
                !banList?.includes(message.userId) && message.channel !== undefined && (
                  <>
                    <span className="channelSender">{message.channel}</span>
                    {" "}
                    <span className="nameSender">{message.name}</span>: {message.text}
                  </>
              ))}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default ChatBody;
