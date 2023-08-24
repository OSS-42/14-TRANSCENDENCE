import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface PrivmsgCommandProps {
    message: string;
    socket: Socket;
    user : User;
  }

const privmsgCommand = ({message, socket, user}: PrivmsgCommandProps) => {
    const [, channelName] = message.split(" ");
    if (channelName) {
      // Format du message pour le serveur
      socket.emit("privmsg", {
        username: user?.username,
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
        name: channelName
      });
    }
}
export default privmsgCommand