import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface ListCommandProps {
    data: string;
    socket: Socket;
    user : User;
  }

  const listCommand = ({data, socket, user}: ListCommandProps) => {
    const [command, ...param] = data.split(" ");
    if (command === "/LIST") {
      // Format du message pour le serveur
      socket.emit("list", {
        message: param,
        name: user?.username,
      });
    }
}
export default listCommand

// 