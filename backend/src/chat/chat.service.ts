import { Injectable } from '@nestjs/common';
import { ChatRoom } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { createMessageDto } from './dto/create.message.dto';

@Injectable()
export class ChatService {
    constructor(private prisma : PrismaService){}

    createMessage(createMessageDto : createMessageDto){
        console.log(createMessageDto)
        return createMessageDto
    }
    //CETTE FONCTION TROUVE LE ID DUN UTILISATEUR AVEC SON USERNAME.
    //Elle retourne null en cas dabsence
    async getUserIdFromUsername(username: string): Promise<number | null> {
        const user = await this.prisma.utilisateur.findFirst({
          where: {
            username
          },
          select: {
            id: true
          }
        });
        return user?.id || null; 
      }
    

        //PERMET DE RECUPERER LE ID de la room : room.id
    async isRoomExist(roomName:string): Promise <ChatRoom | null>{
        //console.log(room)
        const room = await this.prisma.chatRoom.findUnique({
            where: { name : roomName},
          });
          //si room nameName est diffrent de null, on renvoie true. Si roomName n<est pas different de null, on renvoie false.
          return room || null;
    }


    async isUserMemberOfRoom(userId: number, roomId: number): Promise<boolean> {
        const room = await this.prisma.chatRoom.findFirst({
          where: {
            id: roomId,
            members: {
              some: {
                id: userId
              }
            }
          }
        });
      
        return !!room; // Syntaxe mysterieuse : double negation, si room existe = true, si room n<existe pas= false
    }
    

    //CETTE FONCTION CREE UN CHANNEL DANS LA BASE DE DONNEE. 
    //PREMIER ARGUMENT :  le nom du channel
    // DEUXIEME ARGUMENT : l'id du client (UTILISATEUR)
    // Morgan : Il va falloir ajouter un parsing pour le mot de passe (if password !== undefined else ...)
    // Et même chose pour un flag invit pour savoir si le channel est sur invitation (if invite === -i else ...)
    async createRoom(roomName:string, ownerId:number, password: string, invite: boolean): Promise<ChatRoom>{
        const room = await this.prisma.chatRoom.create({
            data: {
                name: roomName,
                invite: invite,
                owner: { connect: { id: ownerId } },
                members: { connect: [{ id: ownerId }] }
              },
          });
         return room 
    } 



     //CETTE FONCTION AJOUTE UN UTILISATEUR DANS UN CHANNEL  (BASE DE DONNEE)
    //PREMIER ARGUMENT :  le ID du channnel *** CE denier peut être recpurer par la fonciton isRoomExist : cette fonction retourne un obet chatRoom
    // DEUXIEME ARGUMENT : l'id du client (UTILISATEUR)
    async joinRoom(roomId: number, memberId: number):Promise<ChatRoom> {
        const room = await this.prisma.chatRoom.update({
        where: { id: roomId }, 
        data: {
            members: { connect: [{ id: memberId }] } 
            }
        });
        return room;
    }



       //CETTE FONCTION BAN UN UTILISATEUR D'UN CHANNEL  (BASE DE DONNEE)
    //PREMIER ARGUMENT :  le ID du channnel *** CE denier peut être recpurer par la fonciton isRoomExist : cette fonction retourne un obet chatRoom
    // DEUXIEME ARGUMENT : l'id du cli (UTILISATEUR)
    async banUserFromRoom(userId: number, roomId: number): Promise<void> {
        await this.prisma.chatRoom.update({
          where: {
            id: roomId
          },
          data: {
            bannedUsers: {
              connect: [{ id: userId }]
            },
            members: {
              disconnect: [{ id: userId }]
            }
          }
        });
      }
    


    async addModerator(roomId: number, memberId: number):Promise<ChatRoom> {
        const room = await this.prisma.chatRoom.update({
        where: { id: roomId }, 
        data: {
            moderators: { connect: [{ id: memberId }] } 
            }
        });
        return room;
    }

    async removeModerator(roomId: number, memberId: number):Promise<ChatRoom> {
        const room = await this.prisma.chatRoom.update({
        where: { id: roomId }, 
        data: {
            moderators: { disconnect: [{ id: memberId }] } 
            }
        });
        return room;
    }
    async isAlreadyMember(userName: string, roomName: string): Promise<boolean> {
      const room = await this.prisma.chatRoom.findFirst({
        where: {
          name: roomName,
          members: {
            some: { username: userName },
          },
        },
      });
     return !!room
    }

    async isBanFromRoom(userName: string, roomName: string): Promise<boolean> {
      const room = await this.prisma.chatRoom.findFirst({
        where: {
          name: roomName,
          bannedUsers: {
            some: { username: userName },
          },
        },
      });
     return !!room
    }
    async isRoomProtected(roomName: string): Promise<boolean> {
      const room = await this.prisma.chatRoom.findFirst({
        where: {
          name: roomName,
          },
      });
     return !!room && !!room.hash; 
    }


    async validatePassword(password:string, roomName:string) {
      const room = await this.prisma.chatRoom.findFirst({
        where: {
          name: roomName,
          },
      });
      const pwMatches = await argon2.verify(
                   room.hash,
                    password
              );
      return pwMatches
      }


    async createPassword(password:string, roomName:string) {
      const hash =  await argon2.hash(password);
      const room = await this.prisma.chatRoom.update({
        where: {
          name: roomName,
          },
              data: {
                hash :hash
              }
      });
      return room
    }
  
  }
