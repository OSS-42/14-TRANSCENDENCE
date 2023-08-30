import { Injectable, NotFoundException } from '@nestjs/common';
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


    async isUserMemberOfRoom(userId: number, roomId: number): Promise<boolean> { // C'est quoi la differnece avec isAlreadyMember ?
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
    async createRoom(roomName:string, ownerId:number, param: string, invite: boolean): Promise<ChatRoom>{
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

    async destroyChatRoom(roomName: string): Promise<void> {
      const chatRoom = await this.prisma.chatRoom.findUnique({ where: { name: roomName } });
  
      if (!chatRoom) {
        throw new NotFoundException(`Chat room with name ${roomName} not found`);
      }
      await this.prisma.chatRoom.delete({ where: { name: roomName } });
    }


    //CETTE FONCTION BAN UN UTILISATEUR D'UN CHANNEL  (BASE DE DONNEE)
    //PREMIER ARGUMENT :  le ID du channnel *** CE denier peut être recpurer par la fonciton isRoomExist : cette fonction retourne un obet chatRoom
    // DEUXIEME ARGUMENT : l'id du cli (UTILISATEUR)
    async banUserFromRoom(userId: number, roomId: number): Promise<ChatRoom> {
        const room =await this.prisma.chatRoom.update({
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
        return room
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

    async removeMember(roomId: number, memberId: number):Promise<ChatRoom> {
      const room = await this.prisma.chatRoom.update({
      where: { id: roomId }, 
      data: {
          members: { disconnect: [{ id: memberId }] } 
          }
      });
      return room;
  }
  async removeBan(roomId: number, bannedId: number):Promise<ChatRoom> {
    const room = await this.prisma.chatRoom.update({
    where: { id: roomId }, 
    data: {
        bannedUsers: { disconnect: [{ id: bannedId }] } 
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
  //Cette fonction retourne l'objet room en fonciton du nom 
    async getRoomByName(roomName:string) {
      const room = await this.prisma.chatRoom.findUnique({
        where: {
          name: roomName,
        },
      });
      return room;
    }

    //Si le channel est privé renvoie vrai sinon faux
    async isRoomPrivate(roomName:string) {
      const room = await this.prisma.chatRoom.findUnique({
        where: {
          name: roomName,
        },
      });
      return room.invite;
    }

    async getUserByName(username:string) {
      const user = await this.prisma.utilisateur.findFirst({
        where: {
          username:username,
        },
      });
      return user;
    }

      
    //retourne vrai ou faux
    async isUserOwnerOfChatRoom(userId:number, chatRoomId:number): Promise<boolean> {
      const user = await this.prisma.utilisateur.findFirst({
        where: {
          id: userId,
        },
        include: {
          ownedChatRooms: {
            where: {
              id: chatRoomId,
            },
          },
        },
      });
  
      if (!user) {
        return false;
      }
  
      return user.ownedChatRooms.length > 0; 
    }

    async isUserModeratorOfChatRoom(userId:number, chatRoomId:number): Promise<boolean> {
      const user = await this.prisma.utilisateur.findFirst({
        where: {
          id: userId,
        },
        include: {
          moderatorChatRooms: {
            where: {
              id: chatRoomId,
            },
          },
        },
      });
  
      if (!user) {
        return false;
      }
  
      return user.moderatorChatRooms.length > 0; 
    }

    //Premier argument :  utilsateur qui est bloqué
    //deuxième argument : utilisateur qui bloque
    async blockUser(blockedUserId: number, isBlockingId: number): Promise<void> {
         await this.prisma.banissement.create({
        data: {
          blockedUser: {
            connect: { id: blockedUserId }, 
          },
          byUser: {
            connect: { id: isBlockingId }, 
          },
        },
      });
    }

    async unblockUser(unblockedUserId: number, isUnblockingId: number): Promise<void> {
      await this.prisma.banissement.deleteMany({
        where: {
          blockedUserId: unblockedUserId,
          byUserId: isUnblockingId,
        },
      });
    }

    // Cette fonction retourne une liste de tous les utilisateurs bloqués par cet Utilisteur(UserId).  C'est une liste de IDs. JE PEUX TE RETOURNE UNE LISTE DE USERNAMES aussi si c'est plus simple pour toi.
    //Avec cette fonction, tu pourras savoir si le client doit afficher les messages; s'il y a une correspondance entre le id de l'expéditeur avec un des ids présent dans blockedUsers
    
    async getBlockedUserIds(userId: number): Promise<number[]> {
      const blockedUsers = await this.prisma.utilisateur.findUnique({
        where: { id: userId },
        // Sélectionne seulement les IDs des utilisateurs bannis
        include: { blockedUsers: { select: { blockedUserId: true } } }, 
      }).blockedUsers();
  
      return blockedUsers.map(blockedUser => blockedUser.blockedUserId);
    }


  }
  
  
  // Une fonction pour kick un utilisateur d'un channel (un kick n'est pas definitif)
  // Une fonction pour mute un utilisateur dans un channel
  // Une fonction pour verifier si un utilisateur est mute dans un channel
  // Une fonction pour retirer le mot de passe d'un channel
  // Une fonction pour que la channel ne soit plus sur invitation
  // Une fonction pour que la channel soit sur invitation