// import React from 'react';
import { useNavigate } from "react-router-dom";

type ChatMessage = {
  id: number; // un identifiant unique pour chaque message
  name: string;
  channel: string;
  text: string;
  notice : string;
};

type ChatBodyProps = {
  messages: ChatMessage[];
};

const ChatBody = ({ messages }: ChatBodyProps) => {
  return (
    <>
      <div className="message__container">
        {messages.map((message) => (
          <div className="message__chats" key={message.id}>
              <p>
              {message.notice ? (
                // Si message.notice n'est pas nulle, affichez son contenu.
                <span className='notice'>{message.notice}</span>
                ) : (
                <>
                {message.channel !== undefined && (
                  <span className="channelSender">{message.channel}</span>
                )}{" "}
                <span className="nameSender">{message.name}</span> :{" "}
                {message.text}
                </>
                )}
              </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default ChatBody;
