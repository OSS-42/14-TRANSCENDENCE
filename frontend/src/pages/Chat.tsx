import { Box, TextField } from '@mui/material'
import { Socket } from 'socket.io-client';
import ChatBar from '../components/Chat/ChatBar';
import ChatBody from '../components/Chat/ChatBox';
import ChatFooter from '../components/Chat/ChatFooter';

// I'll refactor this, but the componenets placement would still be
// where the simple texts are. As it is, I'm not yet confident the
// layout is gonna be responsive to the components' size, etc.
// I'm still not sure how everything interacts, but I'll find out soon enough.

type ChatProps = {
  socket: Socket; // Assurez-vous que ce type correspond au type de socket que vous utilisez
};

export function Chat({ socket } : ChatProps ) {
  socket.emit('allo'); //Pourquoi j'ai deux message dans le console du serveur ?
  // socket.on('allo', () => {
  //   alert('allo');
  // })
  return (
    // main box
    <Box
      sx={{
        display: 'flex',
        padding: '10px',
        height: '92.5vh',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: '11fr .5fr',
          width: '70%',
          padding: '2rem',
          border: '1px solid black',
          gap: '10px',
        }}
      >
        {/* Chat Box */}
        <Box
          sx={{
            border: '1px solid black',
            borderRadius: '4px',
            padding: '1rem',
          }}
        >
          <ChatBody/>
          {/* I'm a chat room box for the messages received. Replace this line with
          a component. */}
        </Box>
          <ChatFooter/>
        {/* <TextField
          id="outlined-basic"
          label="Type your message..."
          variant="outlined"
        /> */}
      </Box>
      {/* Lists Box */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: '8fr 4fr',
          width: '30%',
          padding: '2rem',
          border: '1px solid black',
          gap: '10px',
        }}
      >
        <Box
          sx={{
            border: '1px solid black',
            borderRadius: '4px',
            padding: '1rem',
          }}
        >
          <ChatBar/>
          {/* I'm a box for the friends list. Replace this line with a component. */}
        </Box>
        <Box
          sx={{
            border: '1px solid black',
            borderRadius: '4px',
            padding: '1rem',
          }}
        >
          I'm a box for the friends list. Replace this line with a component.
        </Box>
      </Box>
    </Box>
  )
}
