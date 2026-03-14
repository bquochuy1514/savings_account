import { Module } from '@nestjs/common';
import { SavingsTypeService } from './savings-type.service';
import { SavingsTypeController } from './savings-type.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [SavingsTypeController],
  providers: [SavingsTypeService, PrismaService],
})
export class SavingsTypeModule {}
