import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface ModeCommandProps {
    data: string;
    socket: Socket;
    user : User;
  }

  const modeCommand = ({data, socket, user}: ModeCommandProps) => {
    const [command, channelName, ...param] = data.split(" ");
    if (command === "/MODE") {
      // Format du message pour le serveur
      socket.emit("modeRoom", {
        username: user?.username,
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
        channelName: channelName,
        param : param
      });
    }
}
export default modeCommand

// 