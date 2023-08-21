import { Injectable, NotFoundException } from '@nestjs/common';
import { Utilisateur } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService, 
    ){}
    async getUserInfo(id:number){
        const userId = typeof id === 'string' ? parseInt(id, 10) : id;
        const user = await this.prisma.utilisateur.findUnique({
            where:{
              id: userId,
            } 
        });
        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }
        return user
    }

    async getAllUsers(): Promise <Utilisateur[]>{
       return this.prisma.utilisateur.findMany()
    }
}
