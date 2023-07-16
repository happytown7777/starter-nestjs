import { Controller, Get, HttpStatus, Req, Res } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

@Controller('notifications')
export class NotificationController {
    @Get('')
    async Get(@Res() response, @Req() user: User) {
        return response.status(HttpStatus.OK).json({
        });
    }
}
