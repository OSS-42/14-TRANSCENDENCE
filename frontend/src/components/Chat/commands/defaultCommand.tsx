import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface DefaultCommandProps {
    message: string;
    socket: Socket;
    user : User;
  }

const defaultCommand = ({message, socket, user}: DefaultCommandProps) => {
    socket.emit("message", {
        text: message,
        name: user?.username,
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
    })
}
export default defaultCommand