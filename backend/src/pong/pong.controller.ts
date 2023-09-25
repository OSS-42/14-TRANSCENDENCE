import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { PongService } from './pong.service';

@Controller('pong')
@ApiTags('pong')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class PongController {
    constructor(private pongService: PongService) {}

    @Post("updateHistory")
        updateHistory(@Body() requestBody: any){

            const winnerId = Number(requestBody.winner)
            const loserId = Number(requestBody.loser)

            //return this.pongService.updateHistory(winnerId, loserId)
        }
    

}
