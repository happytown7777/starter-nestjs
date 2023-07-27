import { Body, Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { FamilyService } from './family.service';
import { User } from 'src/user/entities/user.entity';

@Controller('family')
export class FamilyController {
    constructor(private readonly familyServerice: FamilyService,) {

    }

    @Post('/create')
    async CreateFamily(@Res() response, @Body() body) {
        const res = await this.familyServerice.createFamily(body);
        return response.status(HttpStatus.OK).json(res)
    }

    @Post('/update')
    async UpdateFamily(@Res() response, @Body() body, @Req() user: User) {
        const res = await this.familyServerice.updateFamily(body, user.id);
        return response.status(HttpStatus.OK).json(res)
    }

    @Post('/find')
    async FindFamily(@Res() response, @Body() body) {
        const res = await this.familyServerice.findFamily(body);
        return response.status(HttpStatus.OK).json(res)
    }

    @Post('/enter')
    async EnterFamily(@Res() response, @Body() body) {
        const res = await this.familyServerice.enterFamily(body);
        return response.status(HttpStatus.OK).json(res)
    }

    @Get('/members')
    async GetMembers(@Res() response, @Req() req) {
        const res = await this.familyServerice.getMembers(req.user.familyId);
        return response.status(HttpStatus.OK).json(res);
    }

}
