import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Utilisateur } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from "./user.service";

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

    //ajout d<une relation d'amitié
    @ApiParam({ name: 'username', type: String })
    @Get('addFriend/:username')
    addFriend(@Param('username') username:string, @GetUser() user: Utilisateur){

        return this.userService.addFriend(user, username);
    }

    @Post('updateAvatar')
    updateAvatar(@GetUser() user: Utilisateur, @Body() requestBody: any){
        console.log()
    return this.userService.updateAvatar(user, requestBody)
    }

}
