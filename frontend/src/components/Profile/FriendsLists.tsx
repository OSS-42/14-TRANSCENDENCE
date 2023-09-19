import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

export function FriendsList() {
  const [friends, setFriends] = useState(['No friends for the moment ...']) // SetState. Initialize friend to empty array
  const jwt_token = Cookies.get('jwt_token') // Cookies to identify user.

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get('api/users/friendsList', {
          headers: {
            Authorization: 'Bearer ' + jwt_token,
          },
        })
        console.log('Friends list fetching successful')
        setFriends(response.data)
      } catch (error) {
        console.error('Friends list fetching:', error)
      }
    }

    fetchFriends()
  }, [])

  return (
    <Box
      component="div"
      sx={{
        borderTop: '1px dashed #3d3242',
        // borderRadius: '5px',
        fontWeight: 'bold',
        height: '28vh',
        padding: '1rem',
        maxHeight: '370px', // Set a maximum height for scrolling
        overflow: 'auto', // Enable scrolling when content overflows
      }}
    >
      <Typography sx={{ typography: { xs: 'h6', sm: 'h5' } }}>
        FRIENDS
      </Typography>
      {friends.length === 0 ? (
        <Typography
          variant="h6"
          sx={{ typography: { xs: 'body2', sm: 'h6' }, padding: '16px' }}
        >
          You currently have no friends...
        </Typography>
      ) : (
        <ul>
          {friends.map((friend, index) => (
            <Box
              component="div"
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px',
                borderRadius: '5px',
                marginBottom: '5px',
              }}
            >
              <img
                src={friend.avatar}
                alt={friend.username}
                width="50"
                height="50"
                style={{ borderRadius: '50%' }}
              />
              <p>
                {friend.username}
                {/* {connectedUsers.includes(user.id) && (
                  <span style={{ color: "#65bf76" }}>online</span>
                )} */}
              </p>
            </Box>
          ))}
        </ul>
      )}
    </Box>
  )
}
