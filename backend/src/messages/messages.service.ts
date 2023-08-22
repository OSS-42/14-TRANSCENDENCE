import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity'; // Lire doc


/*
  Dans une application web utilisant le framework Socket.io, 
  le fichier monfichier.service.ts serait généralement utilisé 
  pour encapsuler la logique liée à la communication en temps réel 
  entre le serveur (backend) et les clients (frontend) via des websockets.
  
  Les services Socket.io sont couramment utilisés pour gérer les interactions en temps réel, 
  telles que les discussions en direct dans un chat.
*/

@Injectable()
export class MessagesService {
  //Variable

  message: Message[]  = [{name: 'Marius', text: 'coucou'}] //fake database
  
  //Function

  create(createMessageDto: CreateMessageDto) {
    const message = {... }
    return this.message.push(createMessageDto); //Je pousse dans la fake database
  }

  findAll() {
    return this.message;
  }
}
