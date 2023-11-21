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

  const unbanCommand = ({data, socket, user}: BanCommandProps) => {
    const [command, target, ...channel] = data.split(" ");
    if (command === "/UNBAN") {
      // Format du message pour le serveur
      socket.emit("unbanUser", {
        username: user?.username,
        channelName: channel,
        target: target
      });
    }
}
export default unbanCommand

// 