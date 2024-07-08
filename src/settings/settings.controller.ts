import { Body, Controller, Get, HttpStatus, Post, Put, Req, Res } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { User } from 'src/user/entities/user.entity';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsServerice: SettingsService,) {

    }

    @Post('/get')
    async GetUserSetting(@Res() response, @Req() req, @Body() body) {
        const res = await this.settingsServerice.getUserSettings(body?.userId);
        return response.status(HttpStatus.OK).json(res)
    }

    @Post('/update')
    async UpdateUserSetting(@Res() response, @Req() req, @Body() body) {
        const res = await this.settingsServerice.updateUserSettings(req.user.id, body);
        return response.status(HttpStatus.OK).json(res)
    }

}
