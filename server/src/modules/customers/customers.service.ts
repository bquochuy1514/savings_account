import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from 'src/prisma.service';
import { FindCustomerByIdNumberDto } from './dto/find-customer-by-idNumber';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async handleCreateCustomer(createCustomerDto: CreateCustomerDto) {
    const existingIdNumber = await this.prisma.customer.findUnique({
      where: { idNumber: createCustomerDto.idNumber },
      include: { savingsBooks: true },
    });

    if (existingIdNumber)
      throw new ConflictException(
        'CMND/CCCD đã tồn tại trong hệ thống. Hãy chọn khách hàng cũ',
      );

    return this.prisma.customer.create({
      data: createCustomerDto,
    });
  }

  handleFindAllCustomers() {
    return this.prisma.customer.findMany();
  }

  async handleFindCustomerByIdNumber(
    findCustomerByIdNumberDto: FindCustomerByIdNumberDto,
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: { idNumber: findCustomerByIdNumberDto.idNumber },
    });
    if (!customer)
      throw new NotFoundException(
        `Không tìm thấy khách hàng với số CCCD ${findCustomerByIdNumberDto.idNumber}`,
      );
    return customer;
  }

  async handleFindOneCustomer(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { savingsBooks: true },
    });

    if (!customer) throw new NotFoundException('Không tìm thấy khách hàng');

    return customer;
  }

  async handleUpdateCustomer(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { savingsBooks: true },
    });

    if (!customer) throw new NotFoundException('Không tìm thấy khách hàng');

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async handleDeleteCustomer(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { savingsBooks: true },
    });

    if (!customer) throw new NotFoundException('Không tìm thấy khách hàng');

    if (customer.savingsBooks.length > 0)
      throw new ConflictException('Khách hàng còn sổ tiết kiệm đang mở');

    return this.prisma.customer.delete({ where: { id } });
  }
}
