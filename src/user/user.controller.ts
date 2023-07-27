
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, UploadedFiles, Put, Req, Res, UseInterceptors, UploadedFile } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";
import { JwtService } from '@nestjs/jwt'
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('/auth')
export class UserController {
    constructor(private readonly userServerice: UserService,
        private jwtService: JwtService
    ) {

    }

    @Post('/signup')
    async Signup(@Res() response, @Body() user: User) {
        const newUSer = await this.userServerice.signup(user);
        return response.status(HttpStatus.CREATED).json({
            newUSer
        })
    }
    @Post('/login')
    async SignIn(@Res() response, @Body() user: User) {
        const token = await this.userServerice.signin(user, this.jwtService);
        return response.status(HttpStatus.OK).json(token)
    }

    @Post('/google-login')
    async GoogleLogin(@Res() response, @Body() body) {
        const token = await this.userServerice.googleLogin(body.authToken, this.jwtService);
        return response.status(HttpStatus.OK).json(token)
    }

    @Get('/setting')
    async GetSetting(@Res() response, @Req() user: User) {
        return response.status(HttpStatus.OK).json({
        });
    }

    @Get('/profile/me')
    async GetMyProfile(@Res() response, @Req() user: User) {
        const newUSer = await this.userServerice.getOne(user.email);
        return response.status(HttpStatus.OK).json(newUSer);
    }

    @Post('/upload-photo')
    @UseInterceptors(FileInterceptor('file'))
    async UplaodPhoto(@UploadedFile() file: Express.Multer.File) {
        console.log(file);
    }

}
