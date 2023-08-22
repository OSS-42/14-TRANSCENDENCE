import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthControler } from "./auth.controler";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategy";

@Module({
    imports: [JwtModule.register({})],
    controllers : [AuthControler],
    providers : [AuthService, JwtStrategy],
})
export class  AuthModule{}