import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
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
    
  
    @Post('/check')
    async CheckFamily(@Res() response, @Body() body) {
        const res = await this.familyServerice.checkFamily(body);
        return response.status(HttpStatus.OK).json(res)
    }
  

    @Post('/update')
    async UpdateFamily(@Res() response, @Body() body) {
        const res = await this.familyServerice.updateFamily(body);
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

    @Post('/member')
    async FindMember(@Res() response, @Body() body) {
        const res = await this.familyServerice.findMember(body.email);
        return response.status(HttpStatus.OK).json(res);
    }

    @Get('/motos')
    async GetAllMotos(@Res() response, @Req() req) {
        const res = await this.familyServerice.getAllMotos(req.user);
        return response.status(HttpStatus.OK).json(res);
    }

    @Get('/current_moto')
    async GetCurrentMoto(@Res() response, @Req() req) {
        const res = await this.familyServerice.getCurrentMoto(req.user);
        return response.status(HttpStatus.OK).json(res);
    }

    @Post('/moto/create')
    async CreateMoto(@Res() response, @Req() req, @Body() body) {
        const res = await this.familyServerice.createMoto(req.user, body);
        return response.status(HttpStatus.OK).json(res);
    }

    @Post('/moto/:id/update')
    async UpdateMoto(@Param('id') id: string, @Res() response, @Body() body) {
        const res = await this.familyServerice.updateMoto(body, id);
        return response.status(HttpStatus.OK).json(res);
    }

    @Post('/moto/:id/archive')
    async ArchieveMoto(@Param('id') id: string, @Res() response) {
        const res = await this.familyServerice.archieveMoto(id);
        return response.status(HttpStatus.OK).json(res);
    }

    @Delete('/moto/:id/remove')
    async RemoveMoto(@Param('id') id: string, @Res() response) {
        const res = await this.familyServerice.removeMoto(id);
        return response.status(HttpStatus.OK).json(res);
    }

    @Post('/moto/:id/comment')
    async AddFamilyMotoComment(@Param('id') id: string, @Res() response, @Req() req, @Body() body) {
        const res = await this.familyServerice.addFamilyMotoComment(id, req.user.id, body.parentId, body.comment);
        return response.status(HttpStatus.OK).json(res);
    }

    @Delete('/moto/comment/:commentId')
    async removeDiaryComment(@Param('commentId') commentId: string, @Res() response, @Req() req) {
        const result = await this.familyServerice.removeFamilyMotoComment(commentId, req.user.id);
        return response.status(HttpStatus.OK).json(result);
    }

}
