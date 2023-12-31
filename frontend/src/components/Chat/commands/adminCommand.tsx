import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface AdminCommandProps {
    data: string;
    socket: Socket;
    user : User;
  }

  const adminCommand = ({data, socket, user}: AdminCommandProps) => {
    const [command, target, ...channel] = data.split(" ");
    if (command === "/ADMIN") {
      // Format du message pour le serveur
      socket.emit("admin", {
        username: user?.username,
        channelName: channel,
        target: target
      });
    }
}
export default adminCommand

// 