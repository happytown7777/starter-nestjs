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
import EmailService from 'src/email/email.service';
import { resetPasswordTemplate } from 'src/email/templates/reset-password.template';
import { UserEmotions } from './entities/userEmotions.entity';
import { Roles } from './entities/roles.entity';

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
);

@Injectable()
export class UserService {
    constructor(
        private emailService: EmailService,
        @InjectRepository(User) private usersRepository: Repository<User>,
        @InjectRepository(Family) private familyRepository: Repository<Family>,
        @InjectRepository(Settings) private settingsRepository: Repository<Settings>,
        @InjectRepository(UserEmotions) private userEmotionsRepository: Repository<UserEmotions>,
        @InjectRepository(Roles) private rolesRepository: Repository<Roles>,
    ) { }

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
        const userRole = await this.rolesRepository.findOne({ where: { role: user.guardianId ? 'Child' : 'Parent' } });
        const reqBody = {
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.firstName + ' ' + user.lastName,
            birthdate: user.birthdate,
            username: user.username,
            guardianId: user.guardianId,
            email: user.email,
            password: hash,
            emailVeiified: true,
            family: null,
            roleId: userRole.id,
        }
        const newUser = await this.usersRepository.save(reqBody);
        await this.settingsRepository.upsert({ userId: newUser.id, allow_parental_control: user.allowParental, }, ['userId']);
        return { user: newUser };
    }

    async signin(user: User, jwt: JwtService): Promise<any> {
        const foundUser = await this.usersRepository.findOne({ where: { email: user.email } });
        console.log(foundUser, user.password);
        if (foundUser) {
            const { password } = foundUser;
            if (await bcrypt.compare(user.password, password)) {
                const payload = { email: foundUser.email, firstName: foundUser.firstName, lastName: foundUser.lastName, avatar: foundUser.avatar };
                return {
                    accessToken: jwt.sign(payload, {
                        expiresIn: "24h"
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
            const payload = { email: foundUser.email, firstName: foundUser.firstName, lastName: foundUser.lastName, avatar: foundUser.avatar };
            return {
                accessToken: jwt.sign(payload),
                user: foundUser,
            };
        }
        // return new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED)
    }

    async resetPassword(email: string, jwt: JwtService): Promise<any> {
        const foundUser = await this.usersRepository.findOne({ where: { email } });
        if (foundUser) {
            const token = jwt.sign({ email }, {
                secret: "haruhana",
                expiresIn: 21600,
            });
            const res = await this.emailService.sendMail({
                from: process.env.EMAIL_USERNAME,
                to: email,
                subject: "Reset your password",
                html: resetPasswordTemplate('https://haruhana-happytown.com/auth/change-password?token=' + token),
            });
            console.log(res, "email result");
            return { success: Boolean(res) };
        }
        return { success: false, error: "No matching account. Please check email." }
    }

    async verifyPasswordToken(token: string, jwt: JwtService): Promise<any> {
        try {
            const payload = await jwt.verify(token, {
                secret: "haruhana",
            });

            if (typeof payload === 'object' && 'email' in payload) {
                return { success: true };
            }

            return { success: false, error: "No matching account. Please check email." }
        } catch (error) {
            if (error?.name === 'TokenExpiredError') {
                return { success: false, error: "Password reset token expired" }
            }
            return { success: false, error: "Bad Token" }
        }

    }

    async changePassword(password: string, token: string, jwt: JwtService): Promise<any> {
        try {
            const payload = await jwt.verify(token, {
                secret: "haruhana",
            });

            if (typeof payload === 'object' && 'email' in payload) {
                const salt = await bcrypt.genSalt();
                const hash = await bcrypt.hash(password, salt);
                await this.usersRepository.update({ email: payload.email }, { password: hash });
                return { success: true };
            }

            return { success: false, error: "No matching account. Please check email." }
        } catch (error) {
            if (error?.name === 'TokenExpiredError') {
                return { success: false, error: "Password reset token expired" }
            }
            return { success: false, error: "Bad Token" }
        }
    }

    async updatePassword(email: string, currentPassword: string, newPassword: string, jwt: JwtService): Promise<any> {
        const foundUser = await this.usersRepository.findOne({ where: { email } });
        console.log(email, currentPassword, newPassword, foundUser.password);
        if (foundUser) {
            const validPassword = await bcrypt.compare(currentPassword, foundUser.password);
            console.log(validPassword);
            if (!validPassword) {
                return { success: false, error: "Incorrect current password." }
            }
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(newPassword, salt);
            await this.usersRepository.update({ email: email }, { password: hash });
            return { success: true };
        }
        return { success: false, error: "No matching account. Please check email." }
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
        return body;
    }

    async checkGuardian(body): Promise<any> {
        const newUser = await this.usersRepository.findOne({ where: { email: body.email, firstName: body.firstName, lastName: body.lastName, } });
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

    async userEmotion(userId: number): Promise<string> {
        const userEmotion = await this.userEmotionsRepository.findOne({ where: { userId: userId }, order: { createdAt: 'desc' } });
        return userEmotion ? userEmotion.emotion : 'happy';
    }

    async updateUserEmotion(userId: number, emotion: string): Promise<void> {
        const userEmotion = await this.userEmotionsRepository.findOne({ where: { userId: userId }, order: { updatedAt: 'desc' } });
        if (userEmotion && moment(userEmotion.updatedAt).diff(moment(), 'hours') > -1) {
            userEmotion.emotion = emotion;
            await this.userEmotionsRepository.save(userEmotion);
        }
        else {
            await this.userEmotionsRepository.save({ userId, emotion });
        }
    }

}
