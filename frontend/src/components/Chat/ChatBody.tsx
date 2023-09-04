import { Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { fetchBlockedUsers, fetchUserMe } from "../../api/requests";

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
          <div className="message__chats" key={message.id}>
            <p>
              {message.notice ? (
                // Si message.notice n'est pas nulle, affichez son contenu.
                <span className="notice">{message.notice}</span>
              ) : (
                !banList?.includes(message.userId) && (
                  <>
                    {message.channel !== undefined && (
                      <span className="channelSender">{message.channel}</span>
                    )}
                    {" "}
                    <span className="nameSender">{message.name}</span>: {message.text}
                  </>
                )
              )}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default ChatBody;