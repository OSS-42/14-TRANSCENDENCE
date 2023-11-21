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
    let message : string | null = null;
    const [command, target, ...messageArray] = data.split(" ");
    if (messageArray[0] !== "" && messageArray[0] !== undefined)
      message = messageArray.join(" ")
    if (command === "/PRIVMSG") {
      socket.emit("privmsg", {
        username: user?.username,
        channelName: target,
        param: message,
      });
    }
}
export default privmsgCommand

/* Verifier les parametres : 

- Si le deuxieme parametre ne commence pas par ":" alors c'est un message privé
  vers un utilisateur (/PRIVMSG mbertin bla bla bla)
- Si le deuxieme parametre commence par ":" alors c'est un message vers un canal

*/

