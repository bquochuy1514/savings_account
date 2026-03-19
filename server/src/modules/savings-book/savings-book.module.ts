import { Module } from '@nestjs/common';
import { SavingsBookService } from './savings-book.service';
import { SavingsBookController } from './savings-book.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [SavingsBookController],
  providers: [SavingsBookService, PrismaService],
})
export class SavingsBookModule {}
