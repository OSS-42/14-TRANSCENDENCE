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
    if (command === "#INVITE" && target !== undefined && channel !== undefined) {
      // Format du message pour le serveur
      socket.emit("inviteRoom", {
        username: user?.username,
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
        channelName: channel,
        target: target
      });
    }
}
export default inviteCommand

// 