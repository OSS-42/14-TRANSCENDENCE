import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import axios from "axios";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";



@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) {}

  async signToken(
    userId: number,
    email: string
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get("JWT_SECRET");

    const token = await this.jwt.signAsync(payload, {
      expiresIn: "600m",
      secret: secret,
    });
    return {
      access_token: token,
    };
  }

  //Fonction qui contacte lapi--42 afin de recuperer lacces token, elle cree  un nouvelle utilisateur egalement
  async getCode42(code: string) {
    let token: string;
    let UserToken: Promise<{ access_token: string }>;
    const clientID = this.config.get("CLIENT_ID");
    const clientSecret = this.config.get("CLIENT_SECRET");

    try {
      const response = await axios.post(
        `https://api.intra.42.fr/oauth/token`,
        `client_id=${clientID}&client_secret=${clientSecret}&code=${code}&redirect_uri=http://10.11.1.6:8080/api/auth&grant_type=authorization_code`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      console.log("Réponse POST:", response.data);
      token = response.data.access_token;
    } catch (error) {
      console.error("Erreur POST:", error);
    }
    try {
      const response = await fetch("https://api.intra.42.fr/v2/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      if (response.ok) {
        const data = await response.json();

        //Extraction des donnees vers la base de donnees--> login  Si l'utilisateur n'existe pas.  On va utiliser le email a place
        const username = data.login;
        const email = data.email;
        const avatar = data.image.versions.small;
        let user = await this.prisma.utilisateur.findUnique({
          where: { email },
        });
        if (!user) {
          user = await this.prisma.utilisateur.create({
            data: {
              username: username,
              email: email,
              avatar: avatar,
            },
          });
        } else {
          console.log("Utilisateur existe deja");
        }
        UserToken = this.signToken(user.id, user.email);
        // const test = await this.prisma.utilisateur.update({
        //   where: { email: "mbertin@student.42quebec.com" },
        //   data: {
        //     username: "Mangor_la_grosse",
        //     avatar:
        //       "https://images.squarespace-cdn.com/content/v1/55125ce9e4b01593abaf0537/1547716294492-SRU557RUPLCI8P62PNOO/fat34.png?format=1500w",
        //   },
        // });
      } else {
        console.error(
          "Erreur lors de la requête:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    }

    return UserToken;
  }
}

// async signin (dto: AuthDto){
//         //find the user
//         //if user dosent exist throw
//         //...
//         const user = await this.prisma.user.findUnique({
//             where: {
//                 email: dto.email,
//             },
//         });
//         if(!user){
//             throw new ForbiddenException('credentieals incorrect',)
//         };
//         const pwMatches = await argon.verify(
//             user.hash,
//             dto.password
//         );
//         if(!pwMatches)
//             throw new ForbiddenException('credentieals incorrect',);

//         return  this.signToken(user.id, user.email);
//     }
//    async signup(dto: AuthDto){
//         const hash =  await argon.hash(dto.password);
//         try{
//         const user = await this.prisma.user.create({
//             data: {
//                 email: dto.email,
//                 hash: hash,
//             }
//         });

//         //enleve le password
//         delete user.hash;

//         return user;
//     }
//     catch(error){
//         if(error instanceof PrismaClientKnownRequestError){
//             if(error.code === 'P2002'){
//                 throw new ForbiddenException('Credentials taken')
//             }
//         }
//         else {
//             throw error
//         }
//     }
//    }
