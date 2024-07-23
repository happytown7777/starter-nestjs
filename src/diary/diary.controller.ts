import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, Req, Res } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { User } from 'src/user/entities/user.entity';

@Controller('diary')
export class DiaryController {
    constructor(private readonly diaryService: DiaryService) { }

    @Get('topics')
    async GetTopics(@Res() response, @Req() req) {
        const topics = await this.diaryService.getAllTopics(req?.user?.familyId);
        return response.status(HttpStatus.OK).json({ topics });
    }

    @Post('all')
    async GetDiaryList(@Res() response, @Req() req, @Body() body: any) {
        const diaryList = await this.diaryService.getDiaryList(req.user, body);
        return response.status(HttpStatus.OK).json({ diaryList });
    }

    @Get(':id')
    async GetDiaryData(@Res() response, @Param('id') id: string, @Req() req) {
        const res = await this.diaryService.getDiaryData(id, req.user.id);
        return response.status(HttpStatus.OK).json(res);
    }

    @Post('post')
    async postDiary(@Res() response, @Body() body, @Req() req) {
        const res = await this.diaryService.postDiary(body, req.user);
        return response.status(HttpStatus.OK).json(res);
    }

    @Post('edit')
    async editDiary(@Res() response, @Body() body, @Req() req) {
        const res = await this.diaryService.editDiary(body, req.user.id);
        return response.status(HttpStatus.OK).json(res);
    }

    @Post('update')
    async updateDiary(@Res() response, @Body() body, @Req() req) {
        const res = await this.diaryService.updateDiary(body, req.user.id);
        return response.status(HttpStatus.OK).json(res);
    }

    @Post('/like/:id')
    async likeDiary(@Param('id') id: number, @Res() response, @Req() req) {
        await this.diaryService.likeDiary(id, req.user);
        return response.status(HttpStatus.OK).json();
    }

    @Delete('/delete/:id')
    async deleteDiary(@Param('id') id: number, @Res() response, @Req() req) {
        const result = await this.diaryService.deleteDiary(id, req.user);
        return response.status(HttpStatus.OK).json(result);
    }

    @Post('/:id/comment')
    async addDiaryComment(@Param('id') id: number, @Res() response, @Req() req, @Body('comment') comment, @Body('parentId') parentId,) {
        const result = await this.diaryService.addDiaryComment(id, req.user, parentId, comment);
        return response.status(HttpStatus.OK).json(result);
    }

    @Delete('/comment/:id')
    async removeDiaryComment(@Param('id') id: number, @Res() response, @Req() req) {
        const result = await this.diaryService.removeDiaryComment(id, req.user);
        return response.status(HttpStatus.OK).json(result);
    }

    @Post('/user/:id')
    async getUserDiary(@Param('id') id: number, @Res() response, @Req() req, @Body() body,) {
        const result = await this.diaryService.getUserDiaryList(id, req.user.family.id, body);
        return response.status(HttpStatus.OK).json(result);
    }

    @Post('/share')
    async CreateChannel(@Res() response, @Req() req, @Body() body: { diaryId: number, members: User[] }) {
        const res = await this.diaryService.shareDiary(req.user, body);
        return response.status(HttpStatus.OK).json(res);
    }

}
