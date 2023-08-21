import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
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
    @Get('AllUsers')
    getAllUsers(){
        return this.userService.getAllUsers();
    }

    
    //retourne le data d'un utilisateur particulier
    @ApiParam({ name: 'id', type: Number })
    @Get(':id')
    getUserInfo(@Param('id') id:number){

        return this.userService.getUserInfo(id);
    }
}
