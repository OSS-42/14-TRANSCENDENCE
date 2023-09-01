import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface BlockCommandProps {
    data: string;
    socket: Socket;
    user : User;
  }

  const blockCommand = ({data, socket, user}: BlockCommandProps) => {
    const [command, ...target] = data.split(" ");
    if (command === "#BLOCK" && target !== undefined) {
      // Format du message pour le serveur
      socket.emit("blockUser", {
        username: user?.username,
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
        target: target
      });
    }
}
export default blockCommand

// 