import { Box } from '@mui/material'

// Idea: Welcome page containing a little summary of the project,
// and any extra thing we'd like to add.

export function Home() {
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
      I'm a homepage. Say hi.
    </Box>
  )
}
