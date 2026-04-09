import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSavingsTypeDto } from './dto/create-savings-type.dto';
import { UpdateSavingsTypeDto } from './dto/update-savings-type.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SavingsTypeService {
  constructor(private prisma: PrismaService) {}
  async handleCreateSavingsType(dto: CreateSavingsTypeDto) {
    const existing = await this.prisma.savingsType.findFirst({
      where: { termMonths: dto.termMonths, isActive: true },
    });

    if (existing) {
      if (existing.termMonths === 0)
        throw new ConflictException(`Đã tồn tại loại tiết kiệm không kỳ hạn`);
      else
        throw new ConflictException(
          `Đã tồn tại loại tiết kiệm với kỳ hạn ${dto.termMonths} tháng`,
        );
    }

    return this.prisma.savingsType.create({ data: dto });
  }

  handleFindAllSavingsType() {
    return this.prisma.savingsType.findMany();
  }

  handleFindAllActiveSavingsType() {
    return this.prisma.savingsType.findMany({ where: { isActive: true } });
  }

  async handleFindOneSavingsType(id: number) {
    const savingsType = await this.prisma.savingsType.findUnique({
      where: { id },
    });

    if (!savingsType)
      throw new NotFoundException('Không tìm thấy loại tiết kiệm');

    return savingsType;
  }

  async handleUpdateSavingsType(
    id: number,
    updateSavingsTypeDto: UpdateSavingsTypeDto,
  ) {
    const existing = await this.prisma.savingsType.findUnique({
      where: { id },
    });

    if (!existing)
      throw new NotFoundException('Không tìm thấy loại tiết kiệm cần cập nhật');

    return this.prisma.savingsType.update({
      where: { id },
      data: updateSavingsTypeDto,
    });
  }
}
