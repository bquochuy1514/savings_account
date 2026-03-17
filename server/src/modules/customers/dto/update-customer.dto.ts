import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Căn cước công dân không được để trống' })
  @IsString({ message: 'Căn cước công dân phải là chuỗi ký tự' })
  idNumber?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  address?: string;
}
