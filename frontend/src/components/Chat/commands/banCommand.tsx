import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface BanCommandProps {
    data: string;
    socket: Socket;
    user : User;
  }

  const banCommand = ({data, socket, user}: BanCommandProps) => {
    const [command, target, ...channel] = data.split(" ");
    if (command === "#BAN" && target !== undefined && channel !== undefined) {
      // Format du message pour le serveur
      socket.emit("banUser", {
        username: user?.username,
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
        channelName: channel,
        target: target
      });
    }
}
export default banCommand

// 