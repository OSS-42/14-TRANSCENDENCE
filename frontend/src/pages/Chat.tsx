import { Box, TextField } from '@mui/material'

// I'll refactor this, but the componenets placement would still be
// where the simple texts are. As it is, I'm not yet confident the
// layout is gonna be responsive to the components' size, etc.
// I'm still not sure how everything interacts, but I'll find out soon enough.

export function Chat() {
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
          I'm a chat room box for the messages received. Replace this line with
          a component.
        </Box>
        <TextField
          id="outlined-basic"
          label="Type your message..."
          variant="outlined"
        />
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
          I'm a box for the friends list. Replace this line with a component.
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
