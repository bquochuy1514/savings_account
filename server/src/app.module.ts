import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaService } from './prisma.service';
import { SavingsTypeModule } from './modules/savings-type/savings-type.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SavingsBookModule } from './modules/savings-book/savings-book.module';
import { TransactionsModule } from './modules/transactions/transactions.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AuthModule,
    SavingsTypeModule,
    CustomersModule,
    SavingsBookModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
