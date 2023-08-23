import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(
    Strategy,
    'jwt',
    ){
        constructor(config: ConfigService, private prisma: PrismaService){
            super({
                jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
                ignoreExpiration : false,
                secretOrKey: config.get('JWT_SECRET'),
            });
        }

        //Cette focntion intercepte la requete avant qu'elle arrive au controller. 
        //Elle 'append' a la request un payload qui est extrait du Token Jwt. Ainsi, le user est deja identifie
    async validate(payload:{sub: number, email:string}){
        const user = await this.prisma.utilisateur.findUnique({
            where:{
              id: payload.sub,
            } 
        });

        return user
    }
}