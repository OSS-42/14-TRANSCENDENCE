import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient{
    //creation d'un objet configuration avec le module config : 
    constructor(config: ConfigService) {
        super({
            datasources:{
                db:{
                    url: config.get('DATABASE_URL')
                },
            },
        });

    }
}
