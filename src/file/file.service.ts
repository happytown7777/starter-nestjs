import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class FileService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) { }

}
