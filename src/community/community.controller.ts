import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
import { CommunityService } from './community.service';

@Controller('community')
export class CommunityController {
    constructor(private readonly communityService: CommunityService) { }

    @Post('forums')
    async GetForumList(@Res() response, @Body('forumFilter') forumFilter,) {
        const forumList = await this.communityService.getForumList(forumFilter);
        return response.status(HttpStatus.OK).json({ forumList, });
    }

    @Post('subform/:id')
    async GetSubforumData(@Res() response, @Param('id') id, @Body('sortBy') sortBy, @Body('searchKey') searchKey) {
        const subform = await this.communityService.getSubforumData(id, sortBy, searchKey);
        return response.status(HttpStatus.OK).json({ subform });
    }

    @Post('thread/search')
    async SearchThreads(@Res() response, @Body('searchKey') searchKey) {
        const threads = await this.communityService.searchThreads(searchKey);
        return response.status(HttpStatus.OK).json({ threads });
    }

    @Get('thread/:id')
    async GetThreadData(@Res() response, @Param('id') id) {
        const thread = await this.communityService.getThreadData(id);
        return response.status(HttpStatus.OK).json({ thread });
    }

    @Post('thread/post')
    async PostThread(@Res() response, @Body() body, @Req() req) {
        const thread = await this.communityService.postThread(body, req.user);
        return response.status(HttpStatus.OK).json({ thread });
    }

    @Post('/thread/like/:id')
    async likeThread(@Param('id') id: string, @Res() response, @Req() req) {
        await this.communityService.likeThread(id, req.user.id);
        return response.status(HttpStatus.OK).json();
    }

    @Post('/thread/:id/comment')
    async addThreadComment(@Param('id') id: string, @Res() response, @Req() req, @Body('comment') comment, @Body('parentId') parentId,) {
        const result = await this.communityService.addThreadComment(id, req.user.id, parentId, comment);
        return response.status(HttpStatus.OK).json(result);
    }

    @Delete('/thread/comment/:id')
    async removeThreadComment(@Param('id') id: string, @Res() response, @Req() req) {
        const result = await this.communityService.removeThreadComment(id, req.user.id);
        return response.status(HttpStatus.OK).json(result);
    }

}
