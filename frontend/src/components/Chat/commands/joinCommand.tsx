import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface JoinCommandProps {
    data: string;
    socket: Socket;
    user : User;
  }

  const joinCommand = ({data, socket, user}: JoinCommandProps) => {
    const [command, channelName, ...param] = data.split(" ");
    if (command === "/JOIN") {
      // Format du message pour le serveur
      socket.emit("joinRoom", {
        username: user?.username,
        channelName: channelName,
        param : param
      });
    }
}
export default joinCommand

// 