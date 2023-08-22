import { Box } from '@mui/material'
import { Socket } from 'socket.io-client';

type PongProps = {
  socket: Socket; // Assurez-vous que ce type correspond au type de socket que vous utilisez
};

export function Pong({ socket } : PongProps) {
  return (
    <Box
      sx={{
        background: '#e4f7fb',
        borderRadius: '5px',
        margin: '10px',
        padding: '15px',
        height: '92.5vh',
      }}
    >
      I'm a Pong Page. Add my components here.
    </Box>
  )
}
