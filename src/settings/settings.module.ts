import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Settings } from './entities/settings.entity';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService],
  imports: [
    TypeOrmModule.forFeature([User, Settings]),
  ]
})
export class SettingsModule { }
