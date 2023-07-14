import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
);

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private usersRepository: Repository<User>) { }

    async signup(user: User): Promise<User> {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(user.password, salt);
        const reqBody = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
            password: hash,
            emailVeiified: true,
        }
        const newUser = await this.usersRepository.save(reqBody);
        return newUser;
    }

    async signin(user: User, jwt: JwtService): Promise<any> {
        const foundUser = await this.usersRepository.findOne({ where: { email: user.email } });
        if (foundUser) {
            const { password } = foundUser;
            if (bcrypt.compare(user.password, password)) {
                const payload = { email: foundUser.email, firstName: foundUser.firstName, lastName: foundUser.lastName, avatar: foundUser.avatar };
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
        console.log(ticket.getPayload());
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

    async getOne(email: string): Promise<User> {
        return this.usersRepository.findOne({ where: { email: email } });
    }
}
