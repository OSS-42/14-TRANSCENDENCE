import { Body, Controller, Get, ParseIntPipe, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiProperty, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";


//Définition des diffrentes routes du module Auth
@Controller('auth')
@ApiTags('auth')
export class AuthControler {
    constructor(private authService: AuthService) {}
    @Get()
    async getCode42(@Query('code') code: string) {
        console.log('Code:', code); 
        //ici je vais rediriger la reponse vers le frontend
        return this.authService.getCode42(code);
    }

   //@ApiBearerAuth() 
   @Post('signup')
    signup(
        @Body() dto: AuthDto
        ) {
        console.log({
            dto,
        });
        return this.authService.signup(dto);
    }


    @Post('singin')
    singin(@Body() dto: AuthDto){
        console.log({
            dto,
        });
        return this.authService.signin(dto);
    }
}