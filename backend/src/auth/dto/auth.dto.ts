import { ApiProperty } from "@nestjs/swagger";

export interface AuthDto {
    //@ApiProperty()
    email: string;
    password: string;
}