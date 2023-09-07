import { Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { fetchBlockedUsers, fetchUserMe } from "../../api/requests";
import { useAuth } from "../../contexts/AuthContext";

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
	const { user } = useAuth();
  const scroll = useRef<HTMLDivElement | null>(null);

  
	useEffect(() => {
    // Scroll to the bottom when messages change
    scroll.current?.scrollIntoView({ behavior: "smooth" });
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
        {messages.map((message) => (
          <div className="message__chats" key={message.id}>
            {message.notice ? (
              // Si message.notice n'est pas nulle, affichez son contenu.
              <span className="notice">{message.notice}</span>
            ) : (
              !banList?.includes(message.userId) && (
                <>
                  {message.channel !== undefined && (
                    <span className="channelSender">{message.channel}</span>
                  )}{" "}
                  <span className="nameSender">{message.name}</span>:{" "}
                  {message.text}
                </>
              )
            )}
          </div>
        ))}
      </div>
      <div ref={scroll}></div>
    </>
  );
};

export default ChatBody;
