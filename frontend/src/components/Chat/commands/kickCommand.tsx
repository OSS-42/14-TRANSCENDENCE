import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface KickCommandProps {
    data: string;
    socket: Socket;
    user : User;
  }

  const kickCommand = ({data, socket, user}: KickCommandProps) => {
    const [command, target, ...channel] = data.split(" ");
    if (command === "#KICK" && target !== undefined && channel !== undefined) {
      // Format du message pour le serveur
      socket.emit("kickUser", {
        username: user?.username,
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
        channelName: channel,
        target: target
      });
    }
}
export default kickCommand

// 