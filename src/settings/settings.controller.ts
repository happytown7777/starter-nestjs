import { Body, Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { User } from 'src/user/entities/user.entity';

@Controller('family')
export class SettingsController {
    constructor(private readonly familyServerice: SettingsService,) {

    }

}
