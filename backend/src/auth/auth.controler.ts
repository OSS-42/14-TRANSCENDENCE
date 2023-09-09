import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Redirect,
  Res,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiProperty,
  ApiTags,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { AuthDto } from "./dto/auth.dto";
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
    const access_token: string = token_object.access_token;
    res.cookie("jwt_token", access_token, { httpOnly: false, secure: false });
    console.log(token_object);
    return res.redirect("http://192.168.2.77:8080");
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
