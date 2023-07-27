import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Like, Repository } from 'typeorm';
import { Family } from './entities/family.entity';

@Injectable()
export class FamilyService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>, @InjectRepository(Family) private familyRepository: Repository<Family>) { }


    async createFamily(body): Promise<any> {
        try {
            const newFamily = await this.familyRepository.save({ name: body.name, description: body.description });
            let newUser = await this.usersRepository.findOne({ where: { id: body.id } });
            newUser.familyId = newFamily.id;
            await this.usersRepository.save(newUser);
            console.log(newUser);
            return { user: newUser, errors: [] };
        }
        catch (e) {
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

    async updateFamily(body, id): Promise<any> {
        try {
            await this.familyRepository.save(body);
            const user = await this.usersRepository.findOne({ where: { id: id } });
            return { user, errors: [] };
        }
        catch (e) {
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

    async findFamily(body): Promise<any> {
        try {
            const familyList = await this.familyRepository.find({ where: { name: Like(`%${body['name']}%`) }, relations: ['members'] });
            return { familyList: familyList };
        }
        catch (e) {
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

    async enterFamily({ user_id, family_id }): Promise<any> {
        try {
            let newUser = await this.usersRepository.findOne({ where: { id: user_id } });
            newUser.familyId = family_id;
            await this.usersRepository.save(newUser);
            return { user: newUser };
        }
        catch (e) {
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

    async getMembers(familyId): Promise<any> {
        try {
            const memberList: Family = await this.familyRepository.findOne({ where: { id: familyId }, relations: ['members'] });
            return { members: memberList.members };
        }
        catch (e) {
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

}
