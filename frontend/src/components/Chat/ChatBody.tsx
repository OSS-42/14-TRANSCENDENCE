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
  notices: ChatMessage[];
};

const ChatBody = ({ messages, notices }: ChatBodyProps) => {
  return (
    <>
      <div className="message__container">
        {messages.map((message) => (
          <div className="message__chats" key={message.id}>
              <p>
                {message.channel !== undefined && (
                  <span className="channelSender">{message.channel}</span>
                )}{" "}
                <span className="nameSender">{message.name}</span> :{" "}
                {message.text}
              </p>
          </div>
        ))}
        {notices.map((notice) => (
          <div className="message__chats" key={notice.id}>
              <p>
                <span className="notice">{notice.text}</span>
              </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default ChatBody;
