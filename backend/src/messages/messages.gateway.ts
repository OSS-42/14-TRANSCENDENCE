import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

/*
  Les fichiers .gateway.ts sont généralement utilisés pour créer des "gateways" 
  dans une application Node.js avec NestJS, notamment pour gérer la communication en 
  temps réel via des websockets. Un fichier monfichier.gateway.ts peut être utilisé pour définir et 
  gérer des canaux de communication en temps réel entre le serveur et les clients.

   MessagesGateway est une classe décorée avec @WebSocketGateway(), 
   ce qui indique à NestJS que cette classe gère la communication en temps réel via des websockets. 
   
   La méthode create est décorée avec @SubscribeMessage('createMessage'), ce qui signifie qu'elle gère 
   les messages ayant pour nom 'createMessage'. Lorsqu'un message 'chatMessage' est reçu, 
   cette méthode peut traiter le message (par exemple, le stocker en base de données) et ensuite 
   diffuser le message à tous les clients connectés en utilisant this.server.emit().
*/

@WebSocketGateway()
export class MessagesGateway {
  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('createMessage')
  create(@MessageBody() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @SubscribeMessage('findAllMessages')
  findAll() {
    return this.messagesService.findAll();
  }

  @SubscribeMessage('join')
  joinRoom() {
    //TODO
  }
  
  @SubscribeMessage('typing')
  async typing() {
    //TODO
  }
}
