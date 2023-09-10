import { Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { fetchBlockedUsers, fetchUserMe } from "../../api/requests";

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

  useEffect(() => {
    async function fetchUsersData() {
      const user = await fetchUserMe();
      if (user) {
        const banList = await fetchBlockedUsers(user.id);
        setBanList(banList);
      }
    }

    fetchUsersData();
  }, [messages]);

  return (
    <>
      <div className="message__container">
        {messages.map((message) => (
          <div>
            {message.notice ? (
              // Si message.notice n'est pas nulle, affichez son contenu HTML.
              <span
                className="notice"
                dangerouslySetInnerHTML={{ __html: message.notice }} //Fonction de React pour rendre le HTML contenu dans la chaîne de texte.  
              ></span>
            ) :  message.text ? (
              !banList?.includes(message.userId) && (
                <>
                  {message.channel !== undefined && (
                    <span className="channelSender">{message.channel}</span>
                  )}
                  {" "}
                  <span className="nameSender">{message.name}</span>:{" "}
                  {message.text}
                </>
              )
            ) : (
              <span
              className="help"
              dangerouslySetInnerHTML={{ __html: message.help }} //Fonction de React pour rendre le HTML contenu dans la chaîne de texte.  
            ></span>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ChatBody;
