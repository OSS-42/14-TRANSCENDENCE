import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { User } from '../models/User'
import axios from 'axios'
import { AvatarImage } from '../components/Profile/AvatarImage'
import { Name } from '../components/Profile/Name'
import { ContainerGrid } from '../components/Profile/ContainerGrid'
import { RightSideGrid } from '../components/Profile/RightSideGrid'
import { LeftSideGrid } from '../components/Profile/LeftSideGrid'
import { ChangeAvatarButton } from '../components/Profile/ChangeAvatarButton'
import { MatchWonLost } from '../components/Profile/MatchWonLost'
import { FriendsList } from '../components/Profile/FriendsLists'
import { MatchHistory } from '../components/Profile/MatchHistory'
import { useAuth } from '../contexts/AuthContext'
import { fetchMatchHistory, fetchUserMe } from '../api/requests'
import { TwoFactorAuthentication } from '../components/Profile/TwoFactorAuthentication'
import { Link, generatePath, useParams } from 'react-router-dom'
import { Box } from '@mui/material'

export function Profile() {
  const { user } = useAuth()
  const [userData, setUserData] = useState(user)
  const [match, setMatch] = useState({
    matchesWon: [],
    matchesLost: [],
  })

  const params = useParams()
  console.log(params)

  if (params) {
    //THIS MEANS I'M POSSIBLY TRYING TO VIEW SOMEONE ELSE'S PROFILE IN A READ-ONLY MODE
    // Idea: Use the same structure we have for our own profile, but with different fetch requests.
    // The same fetch requests would be used in the User Details Card in the Chat.
    // The same logic can be used to create a link at the UserDetails Card. The router should be able to handle it.

    // Control the flow by checking if any params are passed.

    // Is it a valid username that exists in the database? [YES]-> is it myself? [YES] -> Navigate to /profile
    // Is it a valid username that exists in the database? [YES]-> is it myself? [NO]-> Navigate to /profile/:username (params)

    // Is it a valid username that exists in the database? [NO]-> Navigate to /error

    // if !params -> Continue as before, rendering our own profile.

    return (
      <Box component="div" color="red" marginTop="25rem">
        CLICK ME
        <Link to={generatePath('/profile/:username', { username: 'anarodri' })}>
          LINK
        </Link>
      </Box>
    )
  }
  // <Link to={`/Your-Personal-profile/${comment.UserId}/${post.fullName}`}

  const updateUserData = (newUser) => {
    setUserData(newUser)
  }

  async function getMatchHistory() {
    const matches = await fetchMatchHistory(user.id)
    setMatch(matches)
  }

  useEffect(() => {
    getMatchHistory()
  }, [user])

  return (
    <ContainerGrid>
      <LeftSideGrid>
        <Name user={userData?.username} updateUserData={updateUserData} />
        <AvatarImage user={userData} />
        <ChangeAvatarButton setUser={setUserData} />
        <TwoFactorAuthentication />
      </LeftSideGrid>
      <RightSideGrid>
        <MatchWonLost match={match} />
        <MatchHistory match={match} />
        <FriendsList />
      </RightSideGrid>
    </ContainerGrid>
  )
}
