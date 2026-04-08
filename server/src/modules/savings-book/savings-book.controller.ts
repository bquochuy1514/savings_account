import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { SavingsBookService } from './savings-book.service';
import { CreateSavingsBookDto } from './dto/create-savings-book.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@Controller('savings-book')
export class SavingsBookController {
  constructor(private readonly savingsBookService: SavingsBookService) {}

  @Post()
  @ResponseMessage('Mở sổ tiết kiệm thành công!')
  @UseGuards(JwtAuthGuard)
  createSavingsBook(
    @Body() createSavingsBookDto: CreateSavingsBookDto,
    @Req() req,
  ) {
    return this.savingsBookService.handleCreateSavingsBook(
      createSavingsBookDto,
      req.user,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAllSavingsBook(@Query('customerId') customerId: number) {
    return this.savingsBookService.handleFindAllSavingsBook(customerId);
  }

  @Post('deposit')
  @ResponseMessage('Gởi tiền thành công!')
  @UseGuards(JwtAuthGuard)
  createDeposit(@Body() createDepositDto: CreateDepositDto, @Req() req) {
    return this.savingsBookService.handleCreateDeposit(
      createDepositDto,
      req.user,
    );
  }

  @Post('withdraw')
  @ResponseMessage('Rút tiền thành công!')
  @UseGuards(JwtAuthGuard)
  createWithdrawal(
    @Body() updateSavingsBookDto: CreateWithdrawalDto,
    @Req() req,
  ) {
    return this.savingsBookService.handleCreateWithdrawal(
      updateSavingsBookDto,
      req.user,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOneSavingsBook(@Param('id', ParseIntPipe) id: number) {
    return this.savingsBookService.handleFineOneSavingsBook(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.savingsBookService.remove(+id);
  }
}
