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
    const [command, target, message] = data.split(" ");
    if (command === "PRIVMSG" && target && message) {
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