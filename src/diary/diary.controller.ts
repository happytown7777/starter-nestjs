import { Body, Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { User } from 'src/user/entities/user.entity';

@Controller('diary')
export class DiaryController {
    constructor(private readonly diaryService: DiaryService) { }

    @Get('topics')
    async GetTopics(@Res() response) {
        const topics = await this.diaryService.getAllTopics();
        return response.status(HttpStatus.OK).json({ topics, });
    }

    @Get('')
    async GetDiaryList(@Res() response, @Req() req) {
        const diaryList = await this.diaryService.getDiaryList(req);
        return response.status(HttpStatus.OK).json({ diaryList, });
    }

    @Post('post')
    async postDiary(@Res() response, @Body() body, @Req() req) {
        const msg = await this.diaryService.postDiary(body, req.user);
        return response.status(HttpStatus.OK).json({ error: msg, });
    }
}
