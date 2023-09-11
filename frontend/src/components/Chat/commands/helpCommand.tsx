import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface HelpCommandProps {
    data: string;
    socket: Socket;
    user : User;
  }

  const helpCommand = ({data, socket, user}: HelpCommandProps) => {
    const [command, ...param] = data.split(" ");
    if (command === "/HELP") {
      // Format du message pour le serveur
      socket.emit("help", {
        username: user?.username,
        param: param
      });
    }
}
export default helpCommand

// 