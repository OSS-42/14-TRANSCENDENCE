import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createMessageDto } from './dto/create.message.dto';

@Injectable()
export class ChatService {
    constructor(private prisma : PrismaService){}

    createMessage(createMessageDto : createMessageDto){
        console.log(createMessageDto)
        return createMessageDto
    }

    async isRoomExist(room:string){
        
        const roomName = await this.prisma.chatRoom.findUnique({
            where: { name : room},
          });
          console.log(roomName)
          //si room nameName est diffrent de null, on renvoie true. Si roomName n<est pas different de null, on renvoie false.
          return roomName;
        }
    
    async createRoom(room:string){
    
        const roomName = await this.prisma.chatRoom.create({
            data: {
                name: room,
                //owner: login,
              },
          });
        }
    }
    

