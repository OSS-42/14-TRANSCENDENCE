import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient{
    constructor() {
        super({
            datasources:{
                db:{
                    url: "postgresql://sam:123@db:5432/42trans?schema=public"
                },
            },
        });
    }
}
