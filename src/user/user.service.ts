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
import { familyInviteTemplate } from 'src/email/templates/family-invite.template';
import * as Jimp from 'jimp';
import * as QrCode from 'qrcode-reader';

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

    async signup(user: any): Promise<any> {
        let error = {};
        if (await this.usersRepository.exist({ where: { email: user.email, deletedAt: null } })) {
            error["email"] = "Email already exists.";
        }
        if (Object.keys(error).length > 0) {
            return { error };
        }
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(user.password, salt);
        let userRole: Roles;

        if (!user.isFindFamily && user.familyName) {
            userRole = await this.rolesRepository.findOne({ where: { role: 'Admin' } });
            const newFamily = await this.familyRepository.save({ name: user.familyName, description: `${user.firstName} ${user.lastName}'s family` });
            user.familyId = newFamily.id;
        } else {
            const isParent = moment.utc().diff(moment.utc(user.birthdate), 'years') >= 17;
            userRole = await this.rolesRepository.findOne({ where: { role: isParent ? 'Parent' : 'Child' } });
        }

        const reqBody = {
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.firstName + ' ' + user.lastName,
            birthdate: user.birthdate,
            username: user.username,
            customName: user.customName,
            guardianId: user.guardianId,
            email: user.email,
            password: hash,
            emailVeiified: true,
            familyId: user.familyId,
            roleId: userRole.id,
        }

        const newUser = await this.usersRepository.save(reqBody);
        await this.settingsRepository.upsert({ userId: newUser.id, user: newUser }, ['userId']);
        return { user: newUser };
    }

    async signin(user: User, jwt: JwtService): Promise<any> {
        const foundUser = await this.usersRepository.findOne({ where: { email: user.email, deletedAt: null }, relations: ['family', 'settings'] });
        if (foundUser) {
            const { password } = foundUser;
            if (await bcrypt.compare(user.password, password)) {
                const payload = { email: foundUser.email, firstName: foundUser.firstName, lastName: foundUser.lastName, avatar: foundUser.avatar };
                return {
                    accessToken: jwt.sign(payload, {
                        expiresIn: "240h"
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
        const foundUser = await this.usersRepository.findOne({ where: { email: payload.email, deletedAt: null } });
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
        const foundUser = await this.usersRepository.findOne({ where: { email, deletedAt: null } });
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
        const foundUser = await this.usersRepository.findOne({ where: { email, deletedAt: null } });
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

    async deleteUser(userId): Promise<{ error?: string }> {
        console.log("=====================userId", userId)
        const foundUser = await this.usersRepository.findOne({ where: { id: userId, deletedAt: null } });
        if (foundUser) {
            await this.usersRepository.softDelete(foundUser);
            return { error: '' }
        }
        return { error: 'Member not found' }
    }

    async updateProfile(body: any): Promise<any> {
        const user = await this.usersRepository.findOne({ where: { id: body.id, deletedAt: null } });
        console.log("======", body, user)
        if (user) {
            await this.usersRepository.update({ id: body.id }, body);
        }
        return { success: true, body: body };
    }


    async checkGuardian(body: any): Promise<any> {
        const parentRole = await this.rolesRepository.findOne({ where: { role: 'Parent' } });
        const newUser = await this.usersRepository.findOne({ where: { email: body.email, firstName: body.firstName, lastName: body.lastName, roleId: parentRole.id, deletedAt: null }, relations: ['family'] });
        if (newUser) {
            // const age = moment().diff(newUser.birthdate, 'years');
            // if (age > 16) {
            //     return { guardianId: newUser.id };
            // }
            // else {
            //     return { error: "This account is not old enough to be a guardian." };
            // }
            return { guardianId: newUser.id, family: newUser.family };
        }
        else {
            return { error: "No matching Guardian account. Please check details." };
        }
    }

    async qrcode(fileBuffer: Buffer): Promise<any> {
        try {
            const image = await Jimp.read(fileBuffer);
            const qr = new QrCode();
            return new Promise((resolve, reject) => {
                qr.callback = (err, value) => {
                    if (err) {
                        resolve({ error: 'Error decoding QR code' });
                    } else {
                        resolve({ qrcode: value?.result });
                    }
                };
                qr.decode(image.bitmap);
            })

        } catch (error) {
            return { error: 'Error reading image' };
        }
    }

    async getOne(email: string): Promise<User> {
        return this.usersRepository.findOne({ where: { email: email, deletedAt: null }, relations: ['family', 'settings'] });
    }

    async userEmotion(userId: number): Promise<string> {
        const userEmotion = await this.userEmotionsRepository.findOne({ where: { userId: userId }, order: { createdAt: 'desc' } });
        return userEmotion ? userEmotion.emotion : 'happy';
    }

    async updateUserEmotion(userId: number, emotion: string): Promise<void> {
        const userEmotion = await this.userEmotionsRepository.findOne({ where: { userId: userId }, order: { updatedAt: 'desc' } });
        if (userEmotion && moment(userEmotion.updatedAt).diff(moment(), 'hours') > -1) {
            userEmotion.emotion = emotion;
            await this.userEmotionsRepository.update(userEmotion.id, userEmotion);
            await this.usersRepository.update(userId, { currentEmotion: emotion });
        }
        else {
            if (userEmotion && userEmotion.emotion === emotion) {
                return;
            }
            await this.userEmotionsRepository.save({ userId, emotion });
            await this.usersRepository.update(userId, { currentEmotion: emotion });
        }
    }

    async sendInviteFamilyMember(email: string, link: string, user: any): Promise<any> {
        const res = await this.emailService.sendMail({
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: "You are invited to join Haruhana Happy Town",
            html: familyInviteTemplate({ link, user }),
        });
        console.log(familyInviteTemplate({ link, user }), "email result");
        return { success: Boolean(res) };
    }

}
