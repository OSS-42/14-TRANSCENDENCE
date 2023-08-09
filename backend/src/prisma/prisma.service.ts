import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient{
    constructor() {
        super({
            datasources:{
                db:{
                    url: "postgresql://sam:123@localhost:5432/42trans?schema=public"
                },
            },
        });
    }
}
