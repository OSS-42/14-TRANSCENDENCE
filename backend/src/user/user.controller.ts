import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, Utilisateur } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class UserController {
    @Get('me')
    getMe(@GetUser() user: Utilisateur){
       return (user)
    }
}
