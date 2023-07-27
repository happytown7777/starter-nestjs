import { Module } from '@nestjs/common';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Family } from './entities/family.entity';

@Module({
  controllers: [FamilyController],
  providers: [FamilyService],
  imports: [
    TypeOrmModule.forFeature([User, Family]),
  ]
})
export class FamilyModule { }
