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
    @Get('me')
    getMe(@GetUser() user: Utilisateur){
       return (user)
    }
     @Get('AllUsers')
    getAllUsers(){
        return this.userService.getAllUsers();
    }
    @ApiParam({ name: 'id', type: Number })
    @Get(':id')
    getUserInfo(@Param('id') id:number){

        return this.userService.getUserInfo(id);
    }
}
