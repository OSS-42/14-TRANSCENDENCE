import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import axios from "axios";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ConnectedUsersService } from 'src/connectedUsers/connectedUsers.service';
import * as speakeasy from 'speakeasy';
// import { ChatGateway } from '../chat/chat.gateway';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private readonly connectedUsersService: ConnectedUsersService,
    // private chatGateway: ChatGateway
  ) {}

  async signToken(userId: number, email: string): Promise<{ access_token: string }> {
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




  //Fonction qui contacte l'api-42 afin de récuperer l'acces token, elle cree  un nouvelle utilisateur egalement
  async getCode42(code: string) {
    let token: string;
    let UserToken: Promise<{ access_token: string }> = Promise.resolve({ access_token: '' })
    const clientID = this.config.get("CLIENT_ID");
    const clientSecret = this.config.get("CLIENT_SECRET");
    const host = this.config.get("HOST");

    try{
      const response = await axios.post(
      `https://api.intra.42.fr/oauth/token`,
      `client_id=${clientID}&client_secret=${clientSecret}&code=${code}&redirect_uri=${host}/api/auth&grant_type=authorization_code`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      token = response.data.access_token;
    }
    catch (error) {
      console.error("Erreur POST:", error);
    }
    try{
      const response = await fetch("https://api.intra.42.fr/v2/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      if (response.ok) {
        const data = await response.json();

        //Extraction des donnees vers la base de donnees--> login  Si l'utilisateur n'existe pas.  On va utiliser le email a place
        const username: string = data.login;
        const email :string= data.email;
        const avatar :string = data.image.versions.small;

        let user = await this.prisma.utilisateur.findUnique({
          where: { email },
        });

        const isUsernameTaken = await this.isUsernameTaken(username);
        if (!user) {

          const { v4: uuidv4 } = require('uuid');
          const customPrefix = 'poulet';
          const uniqueId = customPrefix + '-' + uuidv4();
          user = await this.prisma.utilisateur.create({
            data: {
              username: username,
              email: email,
              avatar: avatar,
              secretId: uniqueId
            },
          });
          if (isUsernameTaken) {
            const { v4: uuidv4 } = require('uuid');
            const customPrefix = user.username;
            const uniqueId = customPrefix + '-' + uuidv4().substring(0, 8);
            await this.prisma.utilisateur.update({
              where: { email },
              data: {
                username: uniqueId
                ,
              },
            });
          }
          //Ici eric
          // this.chatGateway.server.emit('newUser', user);
          // this.chatGateway.server.emit('updateConnectedUsers', user);
        } 
        if (this.connectedUsersService.connectedUsers.has(user.id)) {
          (await UserToken).access_token = "poulet"
          return (UserToken)
        }



        UserToken = this.signToken(user.id, user.email);
        this.createRefreshToken(user.id, user.secretId)
    
      }
      else {
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


//---services pour le 2FA----//

// Faire une validation quand la premiere fois qu'il ya une connexion
  async activate2FA(userId: number): Promise<{ otpauthUrl: string, secret: string }> {
    const secret = speakeasy.generateSecret({ length: 20 });

    await this.prisma.utilisateur.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 }
    });

    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: 'Balls of Fury',
      issuer: 'Angry chicken',
    });
    return { otpauthUrl, secret: secret.base32 };
  }

  async deactivate2FA(userId: number): Promise<void> {
    await this.prisma.utilisateur.update({
      where: { id: userId },
      data: { twoFactorSecret: null,
      is2FA: false },
    });
    }

  // This endpoint is to verify2FA right after clicking on activate2FA.
  // To avoid that user forget to scan its QrCode, we force him to scan code and enter it
  // Once done, variable is2FA is set to true. 
  async verify2FA(userId: number, token: string): Promise<boolean> {
    const user = await this.prisma.utilisateur.update({
      where: { id: userId },
      data: { is2FA: true,
      is2FAValidated: true },
    });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
    });
    return verified;
  }

  // Pretty similar to verify2FA endpoint, except that we do not update 
  // the variable is2FA as it is already updated, we simply validate code. 
  async verifyLogin2FA(userId: number, token: string): Promise<boolean> {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
    });

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
    });
    return verified;
  }

  async createRefreshToken(userId: number, secretId:string){
    const payload = {
      secretId,
    };
    const secret = this.config.get("JWT_SECRET");

    const token = await this.jwt.signAsync(payload, {
      expiresIn: "600m",
      secret: secret,
    });


    await this.prisma.utilisateur.update({
    where: { id: userId },
    data: {
      refreshToken: token,
    },
    });

  }


  async generateToken(secretId : string){
    try{
      const user = await this.prisma.utilisateur.findFirst({
        where :{secretId},
      })
      const decoded = this.jwt.verify(user.refreshToken, this.config.get("JWT_SECRET")); 
      console.log(decoded);
      return this.signToken(user.id, user.email)
    }
    catch (err) {
      console.error('JWT validation error:', err.message);
      return null
    }

  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const user = await this.prisma.utilisateur.findFirst({
      where: { username },
    });
    return !!user; // Si l'utilisateur existe, retourne true, sinon retourne false.
  }

}
