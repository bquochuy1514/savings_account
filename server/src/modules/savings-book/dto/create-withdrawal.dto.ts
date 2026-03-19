import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateWithdrawalDto {
  @IsInt({ message: 'ID sổ tiết kiệm phải là số nguyên' })
  @IsPositive({ message: 'ID sổ tiết kiệm phải lớn hơn 0' })
  savingsBookId: number;

  @IsInt({ message: 'ID khách hàng phải là số nguyên' })
  @IsPositive({ message: 'ID khách hàng phải lớn hơn 0' })
  customerId: number;

  @IsDateString({}, { message: 'Ngày rút không hợp lệ' })
  transactionDate: string;

  @IsOptional()
  @IsNumber({}, { message: 'Số tiền rút phải là số' })
  @Min(1, { message: 'Số tiền rút phải lớn hơn 0' })
  amount?: number;
}
