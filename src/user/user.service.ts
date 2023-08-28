import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';
import { Family } from 'src/family/entities/family.entity';
import * as moment from 'moment-timezone';
import { Settings } from 'src/settings/entities/settings.entity';

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
);

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>, @InjectRepository(Family) private familyRepository: Repository<Family>, @InjectRepository(Settings) private settingsRepository: Repository<Settings>,) { }

    async signup(user): Promise<any> {
        let error = {};
        if (await this.usersRepository.exist({
            where: {
                email: user.email,
            }
        })) {
            error["email"] = "Email already exists.";
        }
        if (await this.usersRepository.exist({
            where: {
                username: user.username,
            }
        })) {
            error["username"] = "Username already exists.";
        }
        if (Object.keys(error).length > 0) {
            return { error };
        }
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(user.password, salt);
        const reqBody = {
            fullName: user.fullName,
            birthdate: user.birthdate,
            username: user.username,
            guardianId: null,
            email: user.email,
            password: hash,
            emailVeiified: true,
            family: null,
        }
        const newUser = await this.usersRepository.save(reqBody);
        await this.settingsRepository.upsert({ userId: newUser.id, allow_parental_control: user.allowParental, }, ['userId']);
        return { user: newUser };
    }

    async signin(user: User, jwt: JwtService): Promise<any> {
        const foundUser = await this.usersRepository.findOne({ where: { email: user.email } });
        console.log(foundUser);
        if (foundUser) {
            const { password } = foundUser;
            if (bcrypt.compare(user.password, password)) {
                const payload = { email: foundUser.email, fullName: foundUser.fullName, avatar: foundUser.avatar };
                return {
                    accessToken: jwt.sign(payload, {
                        expiresIn: "8h"
                    }),
                    user: foundUser,
                };
            }
            return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
        }
        return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
    }

    async googleLogin(authToken: string, jwt: JwtService): Promise<any> {
        const r = await client.getToken(authToken);
        const ticket = await client.verifyIdToken({
            idToken: authToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        // console.log(ticket.getPayload());
        const payload = ticket.getPayload();
        const foundUser = await this.usersRepository.findOne({ where: { email: payload.email } });
        if (foundUser) {
            const payload = { email: foundUser.email, fullName: foundUser.fullName, avatar: foundUser.avatar };
            return {
                accessToken: jwt.sign(payload),
                user: foundUser,
            };
        }
        // return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
    }

    async saveInfo(body): Promise<User> {
        const newUser = await this.usersRepository.save(body);
        return newUser;
    }

    async updateProfile(body, user_id): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id: user_id } });
        if (user) {
            await this.usersRepository.update({ id: user_id }, body);
        }
        return user;
    }

    async checkGuardian(body): Promise<any> {
        const newUser = await this.usersRepository.findOne({ where: { email: body.email, fullName: body.fullName } });
        if (newUser) {
            const age = moment().diff(newUser.birthdate, 'years');
            if (age > 16) {
                return { guardianId: newUser.id };
            }
            else {
                return { error: "This account is not old enough to be a guardian." };
            }
        }
        else {
            return { error: "No matching account. Please check details." };
        }
    }

    async getOne(email: string): Promise<User> {
        return this.usersRepository.findOne({ where: { email: email } });
    }

}
