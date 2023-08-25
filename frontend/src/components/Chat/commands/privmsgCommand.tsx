import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface PrivmsgCommandProps {
    data: string;
    socket: Socket;
    user : User;
  }

const privmsgCommand = ({data, socket, user}: PrivmsgCommandProps) => {
    const [command, target, ...messageArray] = data.split(" ");
    const message = messageArray.join(" ");
    if (command === "#PRIVMSG" && target && message) {
      // Format du message pour le serveur
      socket.emit("privmsg", {
        username: user?.username,
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
        target: target,
        message: message,
      });
    }
}
export default privmsgCommand

/* Verifier les parametres : 

- Si le deuxieme parametre ne commence pas par ":" alors c'est un message privé
  vers un utilisateur (#PRIVMSG mbertin bla bla bla)
- Si le deuxieme parametre commence par ":" alors c'est un message vers un canal

*/

