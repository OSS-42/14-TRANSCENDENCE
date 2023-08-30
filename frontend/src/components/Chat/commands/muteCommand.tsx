import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface MuteCommandProps {
    data: string;
    socket: Socket;
    user : User;
  }

  const muteCommand = ({data, socket, user}: MuteCommandProps) => {
    const [command, target, ...channel] = data.split(" ");
    if (command === "#MUTE" && target !== undefined && channel !== undefined) {
      // Format du message pour le serveur
      socket.emit("mute", {
        username: user?.username,
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
        channelName: channel,
        target: target
      });
    }
}
export default muteCommand

// 