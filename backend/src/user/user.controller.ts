import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UserController {
    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getMe(){
        return 'test';
    }
}
