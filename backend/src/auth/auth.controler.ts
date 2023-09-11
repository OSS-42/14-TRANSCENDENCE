import {
  Body,
  Controller,
  Get,
  UseGuards,
  Post,
  Query,
  Res,
  Req,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiProperty,
  ApiTags,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { JwtGuard } from "src/auth/guard";
import { ConfigService } from "@nestjs/config";

//Définition des diffrentes routes du module Auth
@Controller("api/auth")
@ApiTags("auth")
export class AuthControler {
  constructor(private authService: AuthService,
  private config: ConfigService) {}
  @Get("42")
  async login(@Res() res: Response) {
    const uri = this.config.get<string>('URI');
    if (uri) {
      // Si 'URI' est défini dans la configuration, effectuez la redirection
      return res.redirect(uri);
    } else {
      // Sinon, gérez l'absence de 'URI' comme vous le souhaitez
      // Par exemple, affichez un message d'erreur ou redirigez ailleurs
      return res.status(500).json({ message: 'URI not found in configuration' });
    }
  }


  @ApiExcludeEndpoint()
  @Get()
  async getCode42(@Query("code") code: string, @Res() res: Response) {
    console.log("Code:", code);
   
    //ici je vais rediriger la reponse vers le frontend
    const token_object = await this.authService.getCode42(code);
     const host = this.config.get("HOST");
     //ON va avoir besoin d<une PAGE deja log qui ne se connecte pas au sockets.
    if (token_object.access_token === "poulet")
      return  res.redirect(`http://fsdfsfds${host}/sdhajhdjsa`);
    const access_token: string = token_object.access_token;
    
   
    res.cookie("jwt_token", access_token, { httpOnly: false, secure: false });
    console.log(token_object);
    
    return res.redirect(`${host}`);
  }

//---routes pour le 2FA----//


//C<est une route post, mais il n'y a pas de body pour l<instant
  @UseGuards(JwtGuard) 
  @Post('enable2FA')
  async enable2FA(@Req() req) {
    const userId = req.user.id; 
    const { otpauthUrl } = await this.authService.enable2FA(userId);
    return { otpauthUrl };
  }

  //C<est une route post, mais il n'y a pas de body pour l<instant
  @UseGuards(JwtGuard) 
  @Post('disable2FA')
  async disable2FA(@Req() req) {
    const userId = req.user.id;
    await this.authService.disable2FA(userId);
  
    return { message: '2FA has been disabled.' };
  }

  
  @UseGuards(JwtGuard) 
  @Post('verify2FA')
  async verify2FA(@Req() req, @Body() body: { token: string }) {
    const userId = req.user.id; 
    const verified = await this.authService.verify2FA(userId, body.token);

    if (verified) {
      return { message: '2FA code is valid.' };
    } else {
      return { message: 'Invalid 2FA code.' };
    }
  }
}

