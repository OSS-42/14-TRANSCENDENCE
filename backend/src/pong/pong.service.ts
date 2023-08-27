import { Injectable } from '@nestjs/common';
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
}
