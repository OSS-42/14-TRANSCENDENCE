import { Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { fetchBlockedUsers } from "../../api/requests";
import { useAuth } from "../../contexts/AuthContext";

type ChatMessage = {
  userId: number;
  name: string;
  channel: string;
  text: string;
  notice: string;
  help: string;
};

type ChatBodyProps = {
  messages: ChatMessage[];
  socket: Socket;
};

const ChatBody = ({ messages }: ChatBodyProps) => {
  const [banList, setBanList] = useState<number[]>();
  const { user } = useAuth();
  const scroll = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    scroll.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [messages]);

  async function fetchUsersData() {
    // const user = await fetchUserMe();
    if (user) {
      const banList = await fetchBlockedUsers(user.id);
      setBanList(banList);
    }
  }

  useEffect(() => {
    fetchUsersData();
  }, [messages]);

  return (
    <>
      <div className="message__container">
        {messages.map((message, index) => (
          <div key={index}>
            {message.notice ? (
              // Si message.notice n'est pas nulle, affichez son contenu HTML.
              <span
                className="notice"
                dangerouslySetInnerHTML={{ __html: message.notice }} //Fonction de React pour rendre le HTML contenu dans la chaîne de texte.
              ></span>
            ) : message.text ? (
              !banList?.includes(message.userId) && (
                <>
                  {message.channel !== undefined && (
                    <span className="channelSender">{message.channel}</span>
                  )}{" "}
                  <span className="nameSender">{message.name}</span>:{" "}
                  {message.text}
                </>
              )
            ) : (
              <div
                className="help"
                dangerouslySetInnerHTML={{ __html: message.help }} //Fonction de React pour rendre le HTML contenu dans la chaîne de texte.
              ></div>
            )}
          </div>
        ))}
        <div id="msg" ref={scroll}></div>
      </div>
    </>
  );
};

export default ChatBody;
