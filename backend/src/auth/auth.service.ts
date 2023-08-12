import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2' 
import axios from "axios";


const clientID = "u-s4t2ud-c14a5526d27b133c2732f5848ea8a11d76ae8e503f6e495cd3016623aa0c382e";
const clientSecret = "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";
@Injectable({})
export class AuthService{
    constructor(private prisma: PrismaService){}

    //fonction test pour le tuto
    signin (){
        return {msg: "I am signed in"};
    }
   async signup(dto: AuthDto){
        const hash =  await argon.hash(dto.password);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                hash: hash,
            }
        });
        return user;
    }



    //Fonction qui contacte lapi--42 afin de recuperer lacces token, elle cree  un nouvelle utilisateur egalement  
    async getCode42(code: string){
        let  token :string;
        try {
            const response = await axios.post(
                `https://api.intra.42.fr/oauth/token`,
                `client_id=${clientID}&client_secret=${clientSecret}&code=${code}&redirect_uri=http://localhost:3001/auth&grant_type=authorization_code`, 
                {
                    headers: {
                        Accept: 'application/json' 
                    }
                }
            );     
            console.log('Réponse POST:', response.data);
            token =response.data.access_token
            console.log("token;", token);
        } catch (error) {
            console.error('Erreur POST:', error);
        }
       
        try {
            const response = await fetch("https://api.intra.42.fr/v2/me", {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            if (response.ok) {
                const data = await response.json();

                //Extraction des donnees vers la base de donnees--> login  Si l'utilisateur n'existe pas.
                const username = data.login
                const existingUser = await this.prisma.utilisateur.findUnique({
                    where: { username },
                });
                if (!existingUser){
                    const user = await this.prisma.utilisateur.create({
                        data: {
                          username: username,
                        },
                    });
                }
                else{
                    console.log("Utilisateur existe deja");
                }
            } 
            else {
                console.error('Erreur lors de la requête:', response.status, response.statusText);
            }
        } 
        catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
        }
        
        return token;
    }
    
}