import { Body, Controller, Get, ParseIntPipe, Post, Query, Redirect, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiProperty, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { Response } from 'express'
import { AuthDto } from "./dto/auth.dto";

//Définition des diffrentes routes du module Auth
@Controller('auth')
@ApiTags('auth')
export class AuthControler {
    constructor(private authService: AuthService) {}
    @Get('42')
    @Redirect("https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-c14a5526d27b133c2732f5848ea8a11d76ae8e503f6e495cd3016623aa0c382e&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth&response_type=code")
    async login(){    
    }
    //@Redirect("http://localhost:3000")
    @Get()
    async getCode42(@Query('code') code: string, @Res() res: Response) {
        console.log('Code:', code); 
        //ici je vais rediriger la reponse vers le frontend
        const token_object=  await this.authService.getCode42(code);
        const access_token:string = token_object.access_token;
        res.cookie('jwt_token', access_token, { httpOnly: false, secure: false });
        console.log(token_object)

        // Redirect to the desired URL
        return res.redirect('http://localhost:3000/');
    }
}












//    //@ApiBearerAuth() 
//    @Post('signup')
//     signup(
//         @Body() dto: AuthDto
//         ) {
//         console.log({
//             dto,
//         });
//         return this.authService.signup(dto);
//     }


//     @Post('singin')
//     singin(@Body() dto: AuthDto){
//         console.log({
//             dto,
//         });
//         return this.authService.signin(dto);
//     }
// }