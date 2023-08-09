import { Injectable } from "@nestjs/common";

@Injectable({})
export class AuthService{

    signin (){
        return {msg: "I am signed up"};
    }
    signup(){
        return {msg: "I am signed in"};
    }
}