import { Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";

@Controller()
@ApiTags('auth')
export class AuthControler {
    constructor(private authService: AuthService){}
    @Post('signup')
    signup(){
        return this.authService.signup()
        

    }
    @Post('singin')
    singin(){
        return this.authService.signin();
    }
}