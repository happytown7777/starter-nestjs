import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Like, Repository } from 'typeorm';
import { Settings } from './entities/settings.entity';

@Injectable()
export class SettingsService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>, @InjectRepository(Settings) private settingsRepository: Repository<Settings>) { }

    async getUserSettings(userId: number): Promise<any> {
        try {
            const userSetting = await this.settingsRepository.find({ where: { userId } });
            return { userSetting: userSetting[0] };
        }
        catch (e) {
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }
    async updateUserSettings(userId: number, body: any): Promise<any> {
        try {
            await this.settingsRepository.update({ userId }, body)
            return { success: true };
        }
        catch (e) {
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

}
