import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { FindCustomerByIdNumberDto } from './dto/find-customer-by-idNumber';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ResponseMessage('Tạo khách hàng mới thành công!')
  @UseGuards(JwtAuthGuard)
  createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.handleCreateCustomer(createCustomerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAllCustomers() {
    return this.customersService.handleFindAllCustomers();
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  findCustomerByIdNumber(
    @Query() findCustomerByIdNumberDto: FindCustomerByIdNumberDto,
  ) {
    return this.customersService.handleFindCustomerByIdNumber(
      findCustomerByIdNumberDto,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOneCustomer(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.handleFindOneCustomer(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateCustomer(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.handleUpdateCustomer(id, updateCustomerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteCustomer(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.handleDeleteCustomer(id);
  }
}
