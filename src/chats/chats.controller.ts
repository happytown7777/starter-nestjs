import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, Req, Res } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatChannel } from './entities/chat-channel.entity';
import { User } from 'src/user/entities/user.entity';

@Controller('chats')
export class ChatsController {
    constructor(private readonly chatsService: ChatsService) { }

    @Get('channels')
    async GetChannels(@Res() response, @Req() req) {
        const channels = await this.chatsService.getAllChannels(req.user);
        return response.status(HttpStatus.OK).json({ channels, });
    }

    @Get('/:isGroup/:chatId')
    async FetchChannelInfo(@Res() response, @Req() req, @Param('isGroup') isGroup: string, @Param('chatId') chatId: string) {
        const channel = await this.chatsService.getChannelInfo(req.user, chatId, isGroup === '1');
        return response.status(HttpStatus.OK).json({ channel, });
    }

    @Post('/channel/create')
    async CreateChannel(@Res() response, @Req() req, @Body() body: { name: string, members: User[], image?: string }) {
        const res = await this.chatsService.createChannel(req.user, body);
        return response.status(HttpStatus.OK).json(res);
    }

}
