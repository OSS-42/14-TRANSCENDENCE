import { Socket } from "socket.io-client";

interface User {
    id: Number;
    username: string;
    avatar: string;
    mail: string;
}

interface DefaultCommandProps {
    data: string;
    socket: Socket;
    user : User;
  }

const defaultCommand = ({data, socket, user}: DefaultCommandProps) => {
    socket.emit("message", {
        message: data,
        name: user?.username,
        id: `${socket.id}${Math.random()}`,
        socketID: socket.id,
    })
}
export default defaultCommand