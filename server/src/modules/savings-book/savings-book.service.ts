import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSavingsBookDto } from './dto/create-savings-book.dto';
import { PrismaService } from 'src/prisma.service';
import { BookStatus, TransactionType } from 'generated/prisma/enums';
import { CreateDepositDto } from './dto/create-deposit.dto';
import {
  addMonths,
  differenceInDays,
  differenceInMonths,
  format,
  isSameDay,
} from 'date-fns';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@Injectable()
export class SavingsBookService {
  constructor(private prisma: PrismaService) {}

  async handleCreateSavingsBook(
    createSavingsBookDto: CreateSavingsBookDto,
    user: any,
  ) {
    const { balance, customerId, openDate, savingsTypeId } =
      createSavingsBookDto;

    // 1. Kiểm tra có khách hàng không?
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) throw new NotFoundException('Không tìm thấy khách hàng');

    // 2. Kiểm tra có loại tiết kiệm không?
    const savingsType = await this.prisma.savingsType.findUnique({
      where: { id: savingsTypeId },
    });

    if (!savingsType || !savingsType.isActive)
      throw new NotFoundException('Không tìm thấy loại tiết kiệm');

    // 3. Kiểm tra số tiền gởi ban đầu
    if (balance < savingsType.minInitDeposit)
      throw new BadRequestException(
        `Số tiền gởi ban đầu tối thiểu là ${savingsType.minInitDeposit.toLocaleString('vi-VN')}đ`,
      );

    // 4. Tạo SavingsBook + Transaction INITIAL_DEPOSIT
    // Thực hiện đảm bảo tất cả các query bên trong phải thành công hết,
    // nếu 1 cái thất bại thì tất cả rollback (hoàn tác) lại.
    return this.prisma.$transaction(async (tx) => {
      const savingsBookResult = await tx.savingsBook.create({
        data: {
          customerId,
          savingsTypeId,
          openDate: new Date(openDate),
          balance,
          openedBy: user.id,
        },
      });

      const transactionResult = await tx.transaction.create({
        data: {
          savingsBookId: savingsBookResult.id,
          type: TransactionType.INITIAL_DEPOSIT,
          amount: balance,
          transactionDate: new Date(openDate),
          performedBy: user.id,
        },
      });

      return { savingsBookResult, transactionResult };
    });
  }

  handleFindAllSavingsBook() {
    return this.prisma.savingsBook.findMany({
      include: {
        customer: true,
        savingsType: true,
        openedByUser: { omit: { password: true, hashedRefreshToken: true } },
      },
    });
  }

  async handleFineOneSavingsBook(id: number) {
    const savingsBook = await this.prisma.savingsBook.findUnique({
      where: { id },
      include: {
        customer: true,
        savingsType: true,
        openedByUser: {
          omit: {
            password: true,
            hashedRefreshToken: true,
          },
        },
      },
    });

    if (!savingsBook)
      throw new NotFoundException('Không tìm thấy sổ tiết kiệm');

    return savingsBook;
  }

  async handleCreateDeposit(createDepositDto: CreateDepositDto, user: any) {
    const { savingsBookId, transactionDate, amount } = createDepositDto;

    // 1. Kiểm tra khách hàng và sổ tồn tại và đang mở
    // Ktra khách hàng
    const customer = await this.prisma.customer.findUnique({
      where: { id: createDepositDto.customerId },
    });

    if (!customer) throw new NotFoundException('Không tồn tại khách hàng');

    // Ktra sổ
    const savingsBook = await this.prisma.savingsBook.findUnique({
      where: { id: savingsBookId },
      include: { savingsType: true },
    });

    if (!savingsBook)
      throw new NotFoundException('Không tìm thấy sổ tiết kiệm');

    if (savingsBook.status === BookStatus.CLOSED)
      throw new BadRequestException('Sổ tiết kiệm đã đóng');

    if (savingsBook.customerId !== customer.id)
      throw new BadRequestException('Khách hàng không khớp với sổ tiết kiệm');

    // 2. Kiểm tra số tiền gởi thêm tối thiểu
    if (amount < savingsBook.savingsType.minAddDeposit)
      throw new BadRequestException(
        `Số tiền gởi thêm tối thiểu là ${savingsBook.savingsType.minAddDeposit.toLocaleString('vi-VN')}đ`,
      );

    // 3. Không kỳ hạn → kiểm tra đã gởi đủ số ngày tối thiểu chưa
    const depositDate = new Date(transactionDate);
    const openDate = new Date(savingsBook.openDate);
    const termMonths = savingsBook.savingsType.termMonths;

    if (termMonths === 0) {
      const daysSinceOpen = differenceInDays(depositDate, openDate);

      if (daysSinceOpen < savingsBook.savingsType.minWithdrawDays) {
        throw new BadRequestException(
          `Sổ không kỳ hạn phải gởi ít nhất ${savingsBook.savingsType.minWithdrawDays} ngày sau khi mở sổ`,
        );
      }
    }

    // 4. Có kỳ hạn → kiểm tra đúng ngày đến kỳ hạn
    if (termMonths > 0) {
      const monthsSinceOpen = differenceInMonths(depositDate, openDate);

      // Phải là bội số kỳ hạn
      if (monthsSinceOpen <= 0 || monthsSinceOpen % termMonths !== 0)
        throw new BadRequestException(
          `Chỉ được gởi thêm khi đúng kỳ hạn (bội số ${termMonths} tháng)`,
        );

      // Phải đúng ngày (không lệch ngày so với ngày mở sổ)
      const expectedDate = addMonths(openDate, monthsSinceOpen);
      if (!isSameDay(depositDate, expectedDate))
        throw new BadRequestException(
          `Ngày gởi phải đúng ngày kỳ hạn ${format(expectedDate, 'dd/MM/yyyy')}`,
        );
    }

    // 5. Cập nhật balance + tạo transaction DEPOSIT trong $transaction
    const [transactionResult, savingsBookResult] =
      await this.prisma.$transaction([
        this.prisma.transaction.create({
          data: {
            savingsBookId,
            type: TransactionType.DEPOSIT,
            amount,
            transactionDate: depositDate,
            performedBy: user.id,
          },
        }),

        this.prisma.savingsBook.update({
          where: { id: createDepositDto.savingsBookId },
          data: { balance: { increment: amount } },
        }),
      ]);

    return { transactionResult, savingsBookResult };
  }

  async handleCreateWithdrawal(
    createWithdrawalDto: CreateWithdrawalDto,
    user: any,
  ) {
    const { customerId, savingsBookId, transactionDate, amount } =
      createWithdrawalDto;
    // 1. Kiểm tra khách hàng và sổ tồn tại và đang mở
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) throw new NotFoundException('Không tìm thấy khách hàng');

    const savingsBook = await this.prisma.savingsBook.findUnique({
      where: { id: savingsBookId },
      include: { savingsType: true },
    });

    if (!savingsBook)
      throw new NotFoundException('Không tìm thấy sổ tiết kiệm');

    if (savingsBook.status === BookStatus.CLOSED)
      throw new BadRequestException('Sổ tiết kiệm đã đóng');

    if (customerId !== savingsBook.customerId)
      throw new BadRequestException('Khách hàng không khớp với sổ tiết kiệm');

    // 2. Validate từng loại sổ
    // * Sổ không kỳ hạn
    const openDate = new Date(savingsBook.openDate);
    const termMonths = savingsBook.savingsType.termMonths;
    const withdrawalDate = new Date(transactionDate);

    if (termMonths === 0) {
      if (!amount) throw new BadRequestException('Cần có số tiền cần rút');

      const daysSinceOpen = differenceInDays(withdrawalDate, openDate);

      if (daysSinceOpen < savingsBook.savingsType.minWithdrawDays)
        throw new BadRequestException(
          `Sổ không kỳ hạn phải rút ít nhất ${savingsBook.savingsType.minWithdrawDays} ngày sau khi mở sổ`,
        );

      if (amount > savingsBook.balance)
        throw new BadRequestException(
          `Số tiền rút (${amount.toLocaleString('vi-VN')}đ) vượt quá số dư (${savingsBook.balance.toLocaleString('vi-VN')}đ) của sổ tiết kiệm`,
        );

      // Chỉ tính lãi trên phần rút
      const interest =
        amount *
        (savingsBook.savingsType.interestRate / 100) *
        (daysSinceOpen / 365);

      const [transactionResult, savingsBookResult] =
        await this.prisma.$transaction([
          this.prisma.transaction.create({
            data: {
              type: TransactionType.WITHDRAWAL,
              amount,
              interest,
              performedBy: user.id,
              transactionDate: withdrawalDate,
              savingsBookId,
            },
          }),
          amount === savingsBook.balance
            ? this.prisma.savingsBook.update({
                where: { id: savingsBookId },
                data: {
                  balance: 0,
                  status: BookStatus.CLOSED,
                },
              })
            : this.prisma.savingsBook.update({
                where: { id: savingsBookId },
                data: {
                  balance: { decrement: amount },
                },
              }),
        ]);

      return { transactionResult, savingsBookResult };
    }

    // * Sổ có kỳ hạn
    if (termMonths > 0) {
      const expectedDays = addMonths(openDate, termMonths);
      if (withdrawalDate < expectedDays)
        throw new BadRequestException(
          `Chỉ được rút khi đến kỳ hạn (${format(expectedDays, 'dd/MM/yyyy')}) của loại tiết kiệm ${termMonths} tháng`,
        );

      const transactions = await this.prisma.transaction.findMany({
        where: {
          savingsBookId: savingsBookId,
          type: {
            in: [TransactionType.DEPOSIT, TransactionType.INITIAL_DEPOSIT],
          },
        },
      });

      const noTermRateSavingsType = await this.prisma.savingsType.findFirst({
        where: { termMonths: 0 },
      });
      if (!noTermRateSavingsType)
        throw new BadRequestException(
          'Không tìm thấy loại tiết kiệm không kỳ hạn',
        );
      const noTermRate = noTermRateSavingsType.interestRate;

      const totalInterest = transactions.reduce((acc, tran) => {
        // số ngày gửi
        const daysHeld = differenceInDays(withdrawalDate, tran.transactionDate);
        // ngày 1 kỳ
        const termDays = termMonths * 30;
        // số kỳ đủ
        const fullTerms = Math.floor(daysHeld / termDays);
        // ngày đủ kỳ
        const fullDays = fullTerms * termDays;
        // ngày lẻ
        const remainDays = daysHeld - fullDays;
        // lãi = lãi đủ kỳ + lãi lẻ
        const interest =
          tran.amount *
            (savingsBook.savingsType.interestRate / 100) *
            (fullDays / 365) +
          tran.amount * (noTermRate / 100) * (remainDays / 365);

        return acc + interest;
      }, 0);

      const [transactionResult, savingsBookResult] =
        await this.prisma.$transaction([
          this.prisma.transaction.create({
            data: {
              type: TransactionType.WITHDRAWAL,
              amount: savingsBook.balance,
              interest: totalInterest,
              savingsBookId: savingsBookId,
              transactionDate: withdrawalDate,
              performedBy: user.id,
            },
          }),

          this.prisma.savingsBook.update({
            where: { id: savingsBookId },
            data: {
              balance: 0,
              status: BookStatus.CLOSED,
            },
          }),
        ]);

      return { transactionResult, savingsBookResult };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} savingsBook`;
  }
}
