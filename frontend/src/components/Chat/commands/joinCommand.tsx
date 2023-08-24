import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface JoinCommandProps {
    message: string;
    socket: Socket;
    user : User;
  }

  const joinCommand = ({message, socket, user}: JoinCommandProps) => {
    const [command, channelName] = message.split(" ");
    if (command === "#JOIN" && channelName) {
      // Format du message pour le serveur
      socket.emit("joinRoom", {
        username: user?.username,
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
        name: channelName
      });
    }
}
export default joinCommand