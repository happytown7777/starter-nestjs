import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';

@Module({
  controllers: [FileController],
  providers: [FileService],
  imports: [
    TypeOrmModule.forFeature([User]),
  ]
})
export class SettingsModule { }
