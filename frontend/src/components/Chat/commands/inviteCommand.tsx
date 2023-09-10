import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface InviteCommandProps {
    data: string;
    socket: Socket;
    user : User;
  }

  const inviteCommand = ({data, socket, user}: InviteCommandProps) => {
    const [command, target, ...channel] = data.split(" ");
    if (command === "/INVITE") {
      // Format du message pour le serveur
      socket.emit("inviteRoom", {
        username: user?.username,
        channelName: channel,
        target: target
      });
    }
}
export default inviteCommand

// 