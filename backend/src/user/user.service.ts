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
        console.log(user.username +" and " + username + " are now friends" )
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
        // Créer l'enregistrement d'amitié
        const friendship = await this.prisma.friendship.create({
            data: {
                user: { connect: { id: user.id } },
                friend: { connect: { id: friend.id } }
            }
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
        // //Je pense que je nai pas besoin de update les users, cela se fait automatiquement???
        // await this.prisma.utilisateur.update({
        //     where: { id: user.id },
        //     data: { friends: { connect: { id: friendship.id } } }
        // });
    
        // await this.prisma.utilisateur.update({
        //     where: { id: friend.id },
        //     data: { friendOf: { connect: { id: friendship.id } } }
        // });
}

