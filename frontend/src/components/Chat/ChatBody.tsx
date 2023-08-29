// import React from 'react';
import { useNavigate } from 'react-router-dom';

type ChatMessage = {
  id: number; // un identifiant unique pour chaque message
  name: string;
  text: string;
};

type ChatBodyProps = {
  messages: ChatMessage[];
};

const ChatBody = ({ messages } : ChatBodyProps) => {
  const navigate = useNavigate();

  const handleLeaveChat = () => {
    // Cette ligne supprime l'élément 'userName' du stockage local (localStorage) du navigateur. 
    // Le stockage local est une petite base de données intégrée au navigateur web qui permet de stocker des données en permanence, même après la fermeture du navigateur. 
    localStorage.removeItem('userName');
    // Redirige l'utilisateur vers l'accueil
    navigate('/');
    window.location.reload();
    // gestion de la db. Deconnexion du channel, nombre de membre present etc ...
  };

  return (
    <>
      <header className="chat__mainHeader">
        <p>Hangout with Colleagues</p>
        <button className="leaveChat__btn" onClick={handleLeaveChat}>
          LEAVE CHAT
        </button>
      </header>

      <div className="message__container">
        {messages.map((message) =>
          message.name === localStorage.getItem('userName') ? (
            <div className="message__chats" key={message.id}>
              <p className="sender__name">You</p>
              <div className="message__sender">
                <p>{message.text}</p>
              </div>
            </div>
          ) : (
            <div className="message__chats" key={message.id}>
              <p>{message.name}</p>
              <div className="message__recipient">
                <p>{message.text}</p>
              </div>
            </div>
          )
        )}

        <div className="message__status">
          <p>Someone is typing...</p>
        </div>
      </div>
    </>
  );
};

export default ChatBody;
