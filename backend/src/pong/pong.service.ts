import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Utilisateur } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PongService {
    constructor(private readonly prisma: PrismaService) {}

    async updateHistory(winnerUsername : string, loserUsername : string){

      const winnerId = await this.getUserIdByUsername(winnerUsername);
      const loserId = await this.getUserIdByUsername(loserUsername);

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

  async getUserIdByUsername(username: string) {
      const user = await this.prisma.utilisateur.findFirst({
        where: {
          username
        },
        select:{
          id: true
        }
      });
      return user?.id || null; 
 
  }
 
}