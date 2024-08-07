import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Like, Repository } from 'typeorm';
import { Family } from './entities/family.entity';
import { FamilyMoto } from './entities/familyMoto.entity';
import { FamilyMotoComment } from './entities/familyMotoComments.entity';

@Injectable()
export class FamilyService {
    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
        @InjectRepository(Family) private familyRepository: Repository<Family>,
        @InjectRepository(FamilyMoto) private familyMotoRepository: Repository<FamilyMoto>,
        @InjectRepository(FamilyMotoComment) private familyMotoCommentRepository: Repository<FamilyMotoComment>,
    ) { }


    async createFamily(body: any): Promise<any> {
        try {
            const newFamily = await this.familyRepository.save({ name: body.name, description: body.description });
            let existUser = await this.usersRepository.findOne({ where: { id: body.id, deletedAt: null } });
            existUser.familyId = newFamily.id;
            await this.usersRepository.save(existUser);
            return { user: existUser, errors: [] };
        }
        catch (e) {
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

    async checkFamily(body: any): Promise<any> {
        const foundFamily = await this.familyRepository.findOne({
            where: { ...body, deletedAt: null },
            relations: ['owner']
        });

        if (foundFamily) {
            return { family: foundFamily };
        }
        else {
            return { success: false, error: "Family not found" };
        }
    }

    async updateFamily(body: any): Promise<any> {
        try {
            const family = await this.familyRepository.findOneBy({ id: body.id, deletedAt: null });
            if (!family) {
                return new HttpException('Family not found', HttpStatus.UNAUTHORIZED)
            }
            await this.familyRepository.save(body);
            return { errors: [] };
        }
        catch (e) {
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

    async findFamily(body: any): Promise<any> {
        try {
            const familyList = await this.familyRepository.find({
                where: { name: Like(`%${body['name']}%`), deletedAt: null },
                relations: ['members']
            });

            return { familyList: familyList };
        }
        catch (e) {
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

    async enterFamily({ user_id, family_id }): Promise<any> {
        try {
            let newUser = await this.usersRepository.findOne({ where: { id: user_id, deletedAt: null } });
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
            const memberList: Family = await this.familyRepository.findOne({
                where: { id: familyId, deletedAt: null },
                relations: ['members']
            });

            return { members: memberList.members };
        }
        catch (e) {
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

    async findMember(email): Promise<any> {
        try {
            const members = await this.usersRepository.find({ where: { email: Like(`%${email}%`), deletedAt: null } });
            return { members };
        }
        catch (e) {
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

    async getAllMotos(user): Promise<any> {
        try {
            const motos = await this.familyMotoRepository.find({ where: { familyId: user.familyId, }, order: { createdAt: 'DESC' }, relations: ['comments'] });
            return { motos };
        }
        catch (e) {
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

    async getCurrentMoto(user): Promise<any> {
        try {
            const currentMoto = await this.familyMotoRepository.findOne({ where: { familyId: user.familyId, archived: false, }, order: { createdAt: 'DESC' }, relations: ['comments'] });
            return { currentMoto };
        }
        catch (e) {
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

    async createMoto(user, body): Promise<any> {
        console.log("=================createMoto==============", body)
        try {
            const newMoto = await this.familyMotoRepository.save({ name: body.name, description: body.description, familyId: user.familyId });
            return { newMoto };
        }
        catch (e) {
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

    async updateMoto(body, id): Promise<any> {
        try {
            const newMoto = await this.familyMotoRepository.update(id, body);
            return { newMoto };
        }
        catch (e) {
            console.error(e);
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

    async archieveMoto(id): Promise<any> {
        try {
            const newMoto = await this.familyMotoRepository.update(id, { archived: true });
            return { newMoto };
        }
        catch (e) {
            console.error(e);
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

    async removeMoto(id): Promise<any> {
        try {
            const familyMoto = await this.familyMotoRepository.findOne({ where: { id } });
            await this.familyMotoRepository.remove(familyMoto);
            return { error: '' };
        }
        catch (e) {
            console.error(e);
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
    }

    async addFamilyMotoComment(id, userId, parentId, comment): Promise<{ error?: string }> {
        await this.familyMotoCommentRepository.save({
            userId,
            familyMotoId: id,
            parentId,
            comment,
        });
        return { error: '' }
    }

    async removeFamilyMotoComment(id, userId): Promise<{ error?: string }> {
        let diaryComment = await this.familyMotoCommentRepository.findOne({
            where: {
                id,
                userId,
            }
        });
        if (diaryComment) {
            await this.familyMotoCommentRepository.delete({ id });
            return { error: '' }
        }
        else {
            return { error: 'No matching comment. Please check details.' }
        }
    }

}
