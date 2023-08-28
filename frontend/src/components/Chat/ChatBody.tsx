// import React from 'react';
import { useNavigate } from "react-router-dom";

type ChatMessage = {
  id: number; // un identifiant unique pour chaque message
  name: string;
  channel: string;
  text: string;
};

type ChatBodyProps = {
  messages: ChatMessage[];
  notice: boolean;
};

const ChatBody = ({ messages, notice }: ChatBodyProps) => {
  return (
    <>
      <div className="message__container">
        {messages.map((message) => (
          <div className="message__chats" key={message.id}>
            {notice ? (
              <p>{message.text}</p>
            ) : (
              <p>
                {message.channel !== undefined && (
                  <span className="channelSender">{message.channel}</span>
                )}{" "}
                <span className="nameSender">{message.name}</span> :{" "}
                {message.text}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default ChatBody;
