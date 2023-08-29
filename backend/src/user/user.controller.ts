import { Body, Controller, Get, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Utilisateur } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from "./user.service";
import * as fs from 'fs';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class UserController {
    constructor(private userService: UserService) {}
    

    //retourne le data de l'utilisateur
    @Get('me')
    getMe(@GetUser() user: Utilisateur){
       return (user)
    }


    //retourne un array d'objets utilisateurs
    @Get('allUsers')
    getAllUsers(){
        return this.userService.getAllUsers();
    }
    @Get('friendsList')
    getFriendsList(@GetUser() user: Utilisateur){
        return this.userService.getFriendsList(user);
    }

    
    //retourne le data d'un utilisateur particulier
    @ApiParam({ name: 'username', type: String })
    @Get(':username')
    getUserInfo(@Param('username') username:string){

        return this.userService.getUserInfo(username);
    }

    @ApiParam({ name: 'id', type: Number })
    @Get('plus/:id')
    getUserInfoPlus(@Param('username') id:number){

        return this.userService.getUserInfoPlus(id);
    }


    //ajout d<une relation d'amitié
    @ApiParam({ name: 'username', type: String })
    @Get('addFriend/:username')
    addFriend(@Param('username') username:string, @GetUser() user: Utilisateur){

        return this.userService.addFriend(user, username);
    }

    @Post('updateAvatar')
    @UseInterceptors(FileInterceptor('avatar')) 
    updateAvatar(@GetUser() user: Utilisateur, @UploadedFile() avatarFile: any){
        
        const originalname = avatarFile.originalname;
    const mimetype = avatarFile.mimetype;
    const buffer = avatarFile.buffer; 

    const imagePath = `./uploads/${originalname}`;
    fs.writeFileSync(imagePath, buffer);
    console.log(imagePath)
    return this.userService.updateAvatar(user, imagePath)
    }

    @ApiParam({ name: 'id', type: Number })
    @Get('matchHistory/:id')
    getUserMatchHistory(@Param('id') id:number){

        return this.userService.getUserMatchHistory(id);
    }
}
