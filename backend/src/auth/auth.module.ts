import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthControler } from "./auth.controler";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategy";
import { ConnectedUsersModule } from "src/connectedUsers/connectedUsers.module";

@Module({
    imports: [JwtModule.register({}), ConnectedUsersModule],
    controllers : [AuthControler],
    providers : [AuthService, JwtStrategy, ConnectedUsersModule],
})
export class  AuthModule{}