import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface UnblockCommandProps {
    data: string;
    socket: Socket;
    user : User;
  }

  const unblockCommand = ({data, socket, user}: UnblockCommandProps) => {
    const [command, ...target] = data.split(" ");
    if (command === "/UNBLOCK") {
      // Format du message pour le serveur
      socket.emit("unblockUser", {
        username: user?.username,
        socketID: socket.id,
        target: target
      });
    }
}
export default unblockCommand
