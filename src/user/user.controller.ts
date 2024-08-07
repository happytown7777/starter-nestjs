
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, UploadedFiles, Put, Req, Res, UseInterceptors, UploadedFile } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";
import { JwtService } from '@nestjs/jwt'
import { FileInterceptor } from "@nestjs/platform-express";
import * as multer from 'multer';

@Controller('/auth')
export class UserController {
    constructor(private readonly userServerice: UserService, private jwtService: JwtService) {

    }

    @Post('/signup')
    async Signup(@Res() response, @Body() user) {
        const res = await this.userServerice.signup(user);
        return response.status(HttpStatus.CREATED).json(res)
    }

    @Post('/login')
    async SignIn(@Res() response, @Body() user: User) {
        const token = await this.userServerice.signin(user, this.jwtService);
        return response.status(HttpStatus.OK).json(token)
    }

    @Post('/qrcode')
    @UseInterceptors(FileInterceptor('file', {
        storage: multer.memoryStorage(),
    }))
    async QrCode(@Res() response, @UploadedFile() file: Express.Multer.File) {
        const res = await this.userServerice.qrcode(file?.buffer);
        return response.status(HttpStatus.OK).json(res);
    }

    @Post('/reset-password')
    async ResetPassword(@Res() response, @Body() body) {
        const res = await this.userServerice.resetPassword(body['email'], this.jwtService);
        return response.status(HttpStatus.OK).json(res)
    }

    @Post('/verify-password-token')
    async VerifyPasswordToken(@Res() response, @Body() body) {
        const res = await this.userServerice.verifyPasswordToken(body['token'], this.jwtService);
        return response.status(HttpStatus.OK).json(res)
    }

    @Post('/change-password')
    async ChangePassword(@Res() response, @Body() body) {
        const res = await this.userServerice.changePassword(body['password'], body['token'], this.jwtService);
        return response.status(HttpStatus.OK).json(res)
    }

    @Post('/update-password')
    async UpdatePassword(@Res() response, @Body() body, @Req() req) {
        const res = await this.userServerice.updatePassword(req.user.email, body['currentPassword'], body['newPassword'], this.jwtService);
        return response.status(HttpStatus.OK).json(res)
    }

    @Post('/google-login')
    async GoogleLogin(@Res() response, @Body() body) {
        const token = await this.userServerice.googleLogin(body.authToken, this.jwtService);
        return response.status(HttpStatus.OK).json(token)
    }

    @Post('/save')
    async SaveInfo(@Res() response, @Body() body) {
        const res = await this.userServerice.saveInfo(body);
        return response.status(HttpStatus.OK).json(res)
    }

    @Post('/check-guardian')
    async CheckGuardian(@Res() response, @Body() body) {
        const res = await this.userServerice.checkGuardian(body);
        return response.status(HttpStatus.OK).json(res)
    }

    @Delete('/delete/:userId')
    async removeDiaryComment(@Param('userId') userId: string, @Res() response, @Req() req) {
        const result = await this.userServerice.deleteUser(userId);
        return response.status(HttpStatus.OK).json(result);
    }

    @Get('/profile/me')
    async GetMyProfile(@Res() response, @Req() req) {
        const newUSer = await this.userServerice.getOne(req.user.email);
        return response.status(HttpStatus.OK).json(newUSer);
    }

    @Put('/profile')
    async UpdateProfile(@Res() response, @Body() body, @Req() req) {
        const res = await this.userServerice.updateProfile(body);
        return response.status(HttpStatus.OK).json(res);
    }

    @Post('/upload-photo')
    @UseInterceptors(FileInterceptor('file'))
    async UplaodPhoto(@UploadedFile() file: Express.Multer.File) {
        console.log(file);
    }

    @Get('/user-emotion')
    async GetUserEmotion(@Res() response, @Req() req) {
        const emotion = await this.userServerice.userEmotion(req.user.id);
        return response.status(HttpStatus.OK).json({ emotion });
    }

    @Post('/update-emotion')
    async UpdateUserEmotion(@Res() response, @Body() body, @Req() req) {
        await this.userServerice.updateUserEmotion(req.user.id, body['emotion']);
        return response.status(HttpStatus.OK).json({});
    }

    @Post('/send-invitation')
    async SendInvitation(@Res() response, @Body('email') email: string, @Body('link') link: string, @Req() req) {
        await this.userServerice.sendInviteFamilyMember(email, link, req.user);
        return response.status(HttpStatus.OK).json({});
    }
}
