import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import ChatBody from '../components/Chat/ChatBody'
import ChatFooter from '../components/Chat/ChatFooter'
import { FriendsAndUsers } from '../components/Chat/FriendsAndUsers'

type ChatMessage = {
  userId: number
  name: string
  channel: string
  text: string
  notice: string
  help: string
}

type ChatProps = {
  socket: Socket
}

export function Chat({ socket }: ChatProps) {
  //la valeur de base de setMessage est prise dans le localStorage

  const handleMessageResponse = (data: ChatMessage) => {
    console.log(data)
    setMessages((prevMessages) => [...prevMessages, data])
  }

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const localValues = localStorage.getItem('chatMessages')
    if (localValues == null) return []
    return JSON.parse(localValues)
  })

  //QUand la variable messages change, on l<enregistre dans le localStorage
  useEffect(() => {
    const messagesJSON = JSON.stringify(messages)
    localStorage.setItem('chatMessages', messagesJSON)
  }, [messages])

  useEffect(() => {
    socket.on('messageResponse', handleMessageResponse)
    socket.on('notice', handleMessageResponse)

    return () => {
      socket.off('messageResponse', handleMessageResponse)
      socket.off('notice', handleMessageResponse)
    }
  }, [socket])

  return (
    <Box
      component="div"
      color="#c9c9c5"
      sx={{
        display: 'flex',
        height: '95%',
        width: '98.5%',
      }}
    >
      <Box
        component="div"
        sx={{
          display: 'grid',
          backgroundColor: '#090609',
          width: '70%',
          padding: '2rem',
          gap: '.5rem',
          borderRadius: '5px 0 0 5px',
        }}
      >
        {/* Chat Box */}
        <Box
          component="div"
          sx={{
            border: '1px solid #ffb63d',
            borderRadius: '5px',
            padding: '1rem',
            overflow: 'auto',
          }}
        >
          <ChatBody messages={messages} socket={socket} />
        </Box>
        <ChatFooter socket={socket} />
      </Box>
      {/* Lists Box */}
      <Box
        component="div"
        sx={{
          display: 'grid',

          backgroundColor: '#090609',
          width: '30%',
          padding: '2rem 2rem 2rem 0',
          borderRadius: '0 5px 5px 0',
        }}
      >
        <Box
          component="div"
          sx={{
            borderRadius: '5px',
            padding: '1rem',
            border: '1px solid #ffb63d',
            overflow: 'auto',
          }}
        >
          <FriendsAndUsers socket={socket} />
        </Box>
      </Box>
    </Box>
  )
}
