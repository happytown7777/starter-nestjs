import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
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

    @Get(':id')
    async GetDiaryData(@Res() response, @Param('id') id: string) {
        const diary = await this.diaryService.getDiaryData(id);
        return response.status(HttpStatus.OK).json({ diary, });
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
}
