import { Module } from '@nestjs/common';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Family } from './entities/family.entity';
import { FamilyMoto } from './entities/familyMoto.entity';
import { FamilyMotoComment } from './entities/familyMotoComments.entity';

@Module({
  controllers: [FamilyController],
  providers: [FamilyService],
  imports: [
    TypeOrmModule.forFeature([User, Family, FamilyMoto, FamilyMotoComment]),
  ]
})
export class FamilyModule { }
