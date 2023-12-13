import { Body, Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { User } from 'src/user/entities/user.entity';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsServerice: SettingsService,) {

    }

    @Get('')
    async GetUserSetting(@Res() response,@Req() req) {
        const res = await this.settingsServerice.getUserSettings(req.user.id);
        return response.status(HttpStatus.OK).json(res)
    }

    @Post('')
    async UpdateUserSetting(@Res() response, @Req() req, @Body() body) {
        const res = await this.settingsServerice.updateUserSettings(req.user.id, body);
        return response.status(HttpStatus.OK).json(res)
    }

}
