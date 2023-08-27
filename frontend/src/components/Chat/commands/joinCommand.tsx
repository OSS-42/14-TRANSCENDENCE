import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface JoinCommandProps {
    data: string;
    socket: Socket;
    user : User;
  }

  const joinCommand = ({data, socket, user}: JoinCommandProps) => {
    const [command, channelName, password, invite] = data.split(" ");
    if (command === "#JOIN" && channelName) {
      // Format du message pour le serveur
      socket.emit("joinRoom", {
        username: user?.username,
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
        channelName: channelName,
        password : password,
        invite : invite
      });
    }
}
export default joinCommand

// 