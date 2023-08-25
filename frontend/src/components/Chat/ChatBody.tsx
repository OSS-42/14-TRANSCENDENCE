// import React from 'react';
import { useNavigate } from 'react-router-dom';

type ChatMessage = {
  id: number; // un identifiant unique pour chaque message
  name: string;
  channel: string;
  text: string;
};

type ChatBodyProps = {
  messages: ChatMessage[];
};

const ChatBody = ({ messages } : ChatBodyProps) => {
  // const navigate = useNavigate();

  // const handleLeaveChat = () => {
  //   // Cette ligne supprime l'élément 'userName' du stockage local (localStorage) du navigateur. 
  //   // Le stockage local est une petite base de données intégrée au navigateur web qui permet de stocker des données en permanence, même après la fermeture du navigateur. 
  //   localStorage.removeItem('userName');
  //   // Redirige l'utilisateur vers l'accueil
  //   navigate('/');
  //   window.location.reload();
  //   // gestion de la db. Deconnexion du channel, nombre de membre present etc ...
  // };
  console.log(messages)
  return (
    <>
      {/* <header className="chat__mainHeader">
        <button className="leaveChat__btn" onClick={handleLeaveChat}>
          LEAVE CHAT
        </button>
      </header> */}

      <div className="message__container">
        {messages.map((message) => (
            <div className="message__chats" key={message.id}>
              {message.channel === undefined ? (
                <p>
                  <span className='nameSender'>{message.name}</span> : {message.text}
                </p>
              ) : (
                <p>
                  <span className='channelSender'>{message.channel}</span> <span className='nameSender'>{message.name}</span> : {message.text}
                </p>
              )}
            </div>
          )
        )}
      </div>
    </>
  );
};

export default ChatBody;
