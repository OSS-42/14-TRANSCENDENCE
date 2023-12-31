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
import { ApiExcludeEndpoint, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { Response } from "express";
import { JwtGuard } from "src/auth/guard";
import { ConfigService } from "@nestjs/config";

//Définition des diffrentes routes du module Auth
@Controller("api/auth")
@ApiTags("auth")
export class AuthControler {
  constructor(
    private authService: AuthService,
    private config: ConfigService
  ) {}
  @Get("42")
  async login(@Res() res: Response) {
    const uri = this.config.get<string>("URI");
    if (uri) {
      // Si 'URI' est défini dans la configuration, effectuez la redirection
      return res.redirect(uri);
    } else {
      // Sinon, gérez l'absence de 'URI' comme vous le souhaitez
      // Par exemple, affichez un message d'erreur ou redirigez ailleurs
      return res
        .status(500)
        .json({ message: "URI not found in configuration" });
    }
  }

  @ApiExcludeEndpoint()
  @Get()
  async getCode42(@Query("code") code: string, @Res() res: Response) {
    const token_object = await this.authService.getCode42(code);
    const host = this.config.get("HOST");
    if (token_object.access_token === "poulet")
      return res.redirect(`${host}/error`);
    const access_token: string = token_object.access_token;

    res.cookie("jwt_token", access_token, { httpOnly: false, secure: false });

    return res.redirect(`${host}`);
  }

  @Post("newToken")
  async newToken(@Body() body: { userSecretId: string }) {
    return this.authService.generateToken(body.userSecretId);
  }
  //---routes pour le 2FA----//

  @UseGuards(JwtGuard)
  @Post("activate2FA")
  async activate2FA(@Req() req) {
    const userId = req.user.id;
    const { otpauthUrl } = await this.authService.activate2FA(userId);
    return { otpauthUrl };
  }

  @UseGuards(JwtGuard)
  @Post("deactivate2FA")
  async deactivate2FA(@Req() req) {
    const userId = req.user.id;
    await this.authService.deactivate2FA(userId);

    return { message: "2FA has been disabled." };
  }

  @UseGuards(JwtGuard)
  @Post("verify2FA")
  async verify2FA(@Req() req, @Body() body: { token: string }) {
    const userId = req.user.id;
    const verified = await this.authService.verify2FA(userId, body.token);

    if (verified) {
      return { message: "2FA code is valid." };
    } else {
      return { message: "Invalid 2FA code." };
    }
  }

  @UseGuards(JwtGuard)
  @Post("verifyLogin2FA")
  async verifyLogin2FA(@Req() req, @Body() body: { token: string }) {
    const userId = req.user.id;
    const verified = await this.authService.verifyLogin2FA(userId, body.token);

    if (verified) {
      return { message: "2FA code is valid." };
    } else {
      return { message: "Invalid 2FA code." };
    }
  }
}
