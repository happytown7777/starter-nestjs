import { Controller, Get, HttpStatus, Req, Res, Put, Param } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get('')
    async Get(@Res() response, @Req() req) {
        const notificationList = await this.notificationService.getUnReadNotifications(req.user.id);
        return response.status(HttpStatus.OK).json({ notificationList, });
    }

    @Put('seen/:id')
    async ReadNotification(@Res() response, @Req() req, @Param('id') id: number) {
        const notificationList = await this.notificationService.setReadNotification(id, req.user.id);
        return response.status(HttpStatus.OK).json({ notificationList, });
    }
    
    @Put('seenall')
    async ReadAllNotifications(@Res() response, @Req() req) {
        const notificationList = await this.notificationService.setReadAllNotifications(req.user.id);
        return response.status(HttpStatus.OK).json({ notificationList, });
    }
}
