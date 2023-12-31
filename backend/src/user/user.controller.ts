

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { Utilisateur } from "@prisma/client";
import { GetUser } from "src/auth/decorator";
import { JwtGuard } from "src/auth/guard";
import { UserService } from "./user.service";
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as fs from "fs";

@Controller("api/users")
@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}

  //retourne le data de l'utilisateur
  @Get("me")
  getMe(@GetUser() user: Utilisateur) {
    const { id, username, avatar, is2FA,  is2FAValidated } = user;
    return { id, username, avatar, is2FA, is2FAValidated };
  }

  //retourne un array d'objets utilisateurs
  @Get("allUsers")
  getAllUsers() {
    return this.userService.getAllUsers();
  }
  @Get("friendsList")
  getFriendsList(@GetUser() user: Utilisateur) {
    return this.userService.getFriendsList(user);
  }

  //retourne le data d'un utilisateur particulier
  @ApiParam({ name: "username", type: String })
  @Get(':username')
  async getUserInfo(@Param('username') username: string) {
    try {
      const user = await this.userService.getUserInfo(username);
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; 
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }


  @ApiParam({ name: "id", type: Number })
  @Get("plus/:id")
  getUserInfoPlus(@Param("username") id: number) {
    return this.userService.getUserInfoPlus(id);
  }

  @ApiParam({ name: "username", type: String })
  @Get("addFriend/:username")
  addFriend(@Param("username") username: string, @GetUser() user: Utilisateur) {
    return this.userService.addFriend(user, username);
  }

  @Post("updateAvatar")
  @UseInterceptors(FileInterceptor("avatar"))
  updateAvatar(@GetUser() user: Utilisateur, @UploadedFile() avatarFile: any) {
    const originalname = avatarFile.originalname;
    const mimetype = avatarFile.mimetype;
    const buffer = avatarFile.buffer;

    let imagePath = `./uploads/${originalname}`;
    fs.writeFileSync(imagePath, buffer);
    imagePath = imagePath.substring(1);
    const Url = "/api" + imagePath;
    return this.userService.updateAvatar(user, Url);
  }

  @ApiParam({ name: "id", type: Number })
  @Get("matchHistory/:id")
  getUserMatchHistory(@Param("id") id: number) {
    return this.userService.getUserMatchHistory(id);
  }
  @ApiParam({ name: "id", type: Number })
  @Get("blockedUsers/:id")
  getBlockedUsers(@Param("id") id: number) {
    return this.userService.blockedUserIds(id);
  }

  
  @ApiParam({ name: "friendId", type: Number })
  @Get("removeFriend/:friendId")
  revomeFriend(
    @Param("friendId") friendId: number,
    @GetUser() user: Utilisateur
  ) {
    return this.userService.destroyFriend(user.id, friendId);
  }


  @ApiParam({ name: "username", type: String })
  @Get("userExist/:username")
  checkIfUserExist(@Param("username") username: string) {
    return this.userService.checkIfUserExist(username);
  }


  @Post("updateUsername")
  updateUsername(
    @GetUser() user: Utilisateur,
    @Body() updateData: { newUsername: string }
  ) {
    console.log("New Username:", updateData);
    return this.userService.updateUsername(user, updateData.newUsername);
  }

  @Post("is2FAValidated")
  is2FAValidated(
    @GetUser() user: Utilisateur,
    @Body() updateData: { value: boolean }
  ) {
    return this.userService.is2FAValidated(user, updateData.value);
  }
}
