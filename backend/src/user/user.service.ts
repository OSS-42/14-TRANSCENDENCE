import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Utilisateur } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService, 
    ){}
    
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

    async getUserInfo(username: string): Promise<Utilisateur> {
        const user = await this.prisma.utilisateur.findFirst({
            where: {
                username: username,
            } 
        });

        if (!user) {
            throw new NotFoundException(`User with username ${username} not found`);
        }

        return user;
    }
    async getUserInfoPlus(id: number): Promise<Utilisateur> {
      const user = await this.prisma.utilisateur.findFirst({
          where: {
              id: id,
          },
          include: {
            friends: true,
            friendOf: true,
            ownedChatRooms: true,
            memberChatRooms: true,
            moderatorChatRooms: true,
            bannedChatRooms: true,
            matchHistoryWinner: true,
            matchHistoryLoser: true,
          },
      });
      if (!user) {
          throw new NotFoundException(`User with username ${id} not found`);
      }
      return user;
  }

    async getAllUsers(): Promise<Utilisateur[]> {
        return this.prisma.utilisateur.findMany();
    }

    //cette fonction est encore tr's myst/reiuse pour moi haha
    async getFriendsList(user: Utilisateur): Promise<Utilisateur[]> {
        const userData = await this.prisma.utilisateur.findUnique({
            where: { id: user.id },
            include: { friends: { include: { friend: true } } }
        });
    
        if (!userData) {
            throw new NotFoundException("User not found");
        }
    
        const friendsList = userData.friends.map(friendship => friendship.friend);
    
        return friendsList;
    }
    



    async addFriend(user : Utilisateur, username: string) {
        const friend = await this.getUserInfo(username);
        if (!friend) {
            throw new NotFoundException("Friend not found");
        }
       
        const existingFriendship = await this.prisma.friendship.findFirst({
            where: {
                OR: [
                    { user: { id: user.id }, friend: { id: friend.id } },
                ]
            }
        });
        if (existingFriendship) {
            throw new ConflictException("Friendship already exists");
        }
        if(user.username === username){
          throw new ConflictException("You can't yourself as friend, sorry you are ALONE");
        }
        // Créer l'enregistrement d'amitié
        console.log(user.username +" and " + username + " are now friends" )
        const friendship = await this.prisma.friendship.create({
            data: {
                user: { connect: { id: user.id } },
                friend: { connect: { id: friend.id } }
            }
        });
    }
    async destroyFriend(userId: number, friendUserId: number): Promise<void> {
       friendUserId = Number(friendUserId) 
      const friendship = await this.prisma.friendship.findFirst({
        where: {
          AND: [
            { userId: userId },
            { friendId: friendUserId },
          ],
        },
      });
  
      if (!friendship) {
        throw new NotFoundException('Friendship not found');
      }
  
      // Supprimer l'amitié
      await this.prisma.friendship.delete({
        where: {
          id: friendship.id,
        },
      });
    }

    async updateAvatar(user : Utilisateur, image: any) {
        // const userToChange = await this.prisma.utilisateur.findUnique({
        //     where: {
        //     id: user.id, 
        //     },
        // });
        // if (!userToChange) {
        //     throw new Error("Utilisateur non trouvé"); 
        // }
      
        const updatedUser= await this.prisma.utilisateur.update({
            where: {
                id: user.id
            },
            data:{
                avatar:image,
            }
        });
      return updatedUser 
    }
  

    async getUserMatchHistory(id: number) {
        id = Number(id)
        const user = await this.prisma.utilisateur.findUnique({
          where: { id },
          include: {
            matchHistoryWinner: {
              include: {
                winner: true,
                loser: true,
              },
            },
            matchHistoryLoser: {
              include: {
                winner: true,
                loser: true,
              },
            },
          },
        });
    
        const matchesWon = user.matchHistoryWinner.map(match => ({
          date: match.createdAt,
          winner: match.winner.username,
          loser: match.loser.username,
        }));
    
        const matchesLost = user.matchHistoryLoser.map(match => ({
          date: match.createdAt,
          winner: match.winner.username,
          loser: match.loser.username,
        }));
        console.log ("voici lhistorique", matchesLost, matchesWon)
        return {
          matchesWon,
          matchesLost,
        };
      }
      

      async  blockedUserIds(userId:number) {
          const id = Number(userId)
          const blockedUsers = await this.prisma.utilisateur.findUnique({
            
            where: { id: id },
            select: {
              blockedUsers: {
                select: {
                  blockedUserId: true,
                },
              },
            },
          });
      
          if (!blockedUsers) {
            return [];
          }
          else {
            const blockedUserIds = blockedUsers.blockedUsers.map((ban) => ban.blockedUserId);
            return blockedUserIds 
          }
      }
    }
  

