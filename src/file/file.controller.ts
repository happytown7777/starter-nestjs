import { Body, Controller, Get, HttpStatus, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileService } from './file.service';
import { User } from 'src/user/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from './utils/file-upload.utils';

@Controller('file')
export class FileController {
    constructor(private readonly familyServerice: FileService,) {

    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './public/uploads/',
            filename: editFileName,
        }),
        // fileFilter: imageFileFilter,
    }))
    uploadFile(@Res() response, @UploadedFile() file: Express.Multer.File) {
        console.log("===============file============", file)
        if (!file) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                error: 'No file uploaded',
            });
        }
        return response.status(HttpStatus.OK).json({
            url: file.path.replace(/public/, ''),
        })
    }
}
