import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, Req, Res } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { User } from 'src/user/entities/user.entity';

@Controller('diary')
export class DiaryController {
    constructor(private readonly diaryService: DiaryService) { }

    @Post('topics')
    async GetTopics(@Res() response, @Req() req) {
        const topics = await this.diaryService.getAllTopics(req?.user?.family?.id);
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
        const msg = await this.diaryService.postDiary(body, req.user);
        return response.status(HttpStatus.OK).json({ error: msg, });
    }

    @Post('edit')
    async editDiary(@Res() response, @Body() body, @Req() req) {
        const msg = await this.diaryService.editDiary(body, req.user);
        return response.status(HttpStatus.OK).json({ error: msg, });
    }

    @Post('/like/:id')
    async likeDiary(@Param('id') id: string, @Res() response, @Req() req) {
        await this.diaryService.likeDiary(id, req.user.id);
        return response.status(HttpStatus.OK).json();
    }

    @Delete('/delete/:id')
    async deleteDiary(@Param('id') id: string, @Res() response, @Req() req) {
        const result = await this.diaryService.deleteDiary(id, req.user.id);
        return response.status(HttpStatus.OK).json(result);
    }

    @Post('/:id/comment')
    async addDiaryComment(@Param('id') id: string, @Res() response, @Req() req, @Body('comment') comment, @Body('parentId') parentId,) {
        const result = await this.diaryService.addDiaryComment(id, req.user.id, parentId, comment);
        return response.status(HttpStatus.OK).json(result);
    }

    @Delete('/comment/:id')
    async removeDiaryComment(@Param('id') id: string, @Res() response, @Req() req) {
        const result = await this.diaryService.removeDiaryComment(id, req.user.id);
        return response.status(HttpStatus.OK).json(result);
    }

    @Post('/user/:id')
    async getUserDiary(@Param('id') id: string, @Res() response, @Req() req, @Body() body,) {
        const result = await this.diaryService.getUserDiaryList(id, req.user.family.id, body);
        return response.status(HttpStatus.OK).json(result);
    }

    @Post('/share')
    async CreateChannel(@Res() response, @Req() req, @Body() body: { diaryId: number, members: User[] }) {
        const res = await this.diaryService.shareDiary(req.user, body);
        return response.status(HttpStatus.OK).json(res);
    }

}
