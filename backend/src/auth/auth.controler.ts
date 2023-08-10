import { Body, Controller, Get, Post } from "@nestjs/common";
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
    signup(@Body()  test: AuthDto){
        test.email = "dindon"
        console.log({
            test,
        });
        return this.authService.signup(test)
    }
    @Post('singin')
    singin(){
        return this.authService.signin();
    }
}