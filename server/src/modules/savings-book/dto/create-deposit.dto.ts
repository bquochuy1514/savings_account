import {
  IsDateString,
  IsInt,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateDepositDto {
  @IsInt({ message: 'ID sổ tiết kiệm phải là số nguyên' })
  @IsPositive({ message: 'ID sổ tiết kiệm phải lớn hơn 0' })
  savingsBookId: number;

  @IsInt({ message: 'ID khách hàng phải là số nguyên' })
  @IsPositive({ message: 'ID khách hàng phải lớn hơn 0' })
  customerId: number;

  @IsDateString({}, { message: 'Ngày gởi không hợp lệ' })
  transactionDate: string;

  @IsNumber({}, { message: 'Số tiền gởi phải là số' })
  @Min(1, { message: 'Số tiền gởi phải lớn hơn 0' })
  amount: number;
}
