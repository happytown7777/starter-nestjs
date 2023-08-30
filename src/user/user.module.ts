import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { Family } from 'src/family/entities/family.entity';
import { Settings } from 'src/settings/entities/settings.entity';
import EmailService from 'src/email/email.service';

@Module({
  controllers: [UserController],
  providers: [UserService, EmailService],
  imports: [    
    TypeOrmModule.forFeature([User, Family, Settings]),
    JwtModule,
  ]
})
export class UserModule { }
