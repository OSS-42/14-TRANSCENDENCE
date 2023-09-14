import { Box } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

// Idea: Welcome page containing a little summary of the project,
// and any extra thing we'd like to add.

export function Home() {
  const { user } = useAuth()

  return (
    <>
      <Box
        component="div"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          background: '#c9c9c5',
          borderRadius: '5px',
          padding: '15px',
          height: '95%',
          width: '98.5%',
          textAlign: 'center',
          paddingBottom: '5rem',
          lineHeight: '2rem',
          fontSize: '1.5rem',
        }}
      >
        {user ? (
          <>
            <div className="text">
              Hey there, {user.username}. :) <br /> Welcome to our
              ft_transcendence!
              <br />
              Hope you have some fun exploring around.
            </div>
            <div className="sign">
              <p>
                Ana
                <br />
                Cesar
                <br />
                Eric
                <br />
                Morgan
                <br />
                Sam
                <br />
                🖤
              </p>
            </div>
            <div className="chicken-dance">
              <img src="../public/chickenhome.gif" />
            </div>
          </>
        ) : (
          <p>Loading user data...</p>
        )}
      </Box>
    </>
  )
}
