import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Utilisateur } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PongService {
    constructor(private readonly prisma: PrismaService) {}

    async updateHistory(winnerId : number, loserId : number){
        const newMatch = await this.prisma.match.create({
            data: {
              winnerId: winnerId,
              loserId: loserId,
            },
          });
      
          return newMatch;

    }

  async getUsernameFromUserId(id: number): Promise<string | null> {
    const user = await this.prisma.utilisateur.findFirst({
      where: {
        id
      },
      select: {
        username: true
      }
    });
    return user?.username || null; 
  }
  
}
