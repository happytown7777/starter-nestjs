import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Like, Repository } from 'typeorm';
import { Settings } from './entities/settings.entity';

@Injectable()
export class SettingsService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>, @InjectRepository(Settings) private familyRepository: Repository<Settings>) { }

}
