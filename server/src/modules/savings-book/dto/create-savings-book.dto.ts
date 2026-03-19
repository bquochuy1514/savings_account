import {
  IsDateString,
  IsInt,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateSavingsBookDto {
  @IsInt({ message: 'ID khách hàng phải là số nguyên' })
  @IsPositive({ message: 'ID khách hàng phải lớn hơn 0' })
  customerId: number;

  @IsInt({ message: 'ID loại tiết kiệm phải là số nguyên' })
  @IsPositive({ message: 'ID loại tiết kiệm phải lớn hơn 0' })
  savingsTypeId: number;

  @IsDateString({}, { message: 'Ngày mở sổ không hợp lệ' })
  openDate: string;

  @IsNumber({}, { message: 'Số tiền gởi phải là số' })
  @Min(1, { message: 'Số tiền gởi phải lớn hơn 0' })
  balance: number;
}
