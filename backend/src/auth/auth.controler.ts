import { Body, Controller, Get, ParseIntPipe, Post } from "@nestjs/common";
import { ApiProperty, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";


@Controller('auth')
@ApiTags('auth')
export class AuthControler {
    constructor(private authService: AuthService) {}
    @Get()
    poulet(){
        return this.authService.signin();

    }

    @Post('signup')
    signup(
        @Body() dto: AuthDto
        ) {
        console.log({
            dto,
        });
        return this.authService.signup()
    }


    @Post('singin')
    singin(){
        return this.authService.signin();
    }
}