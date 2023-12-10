import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Put,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

const packagePricing = {
  'package 1': 19500,
  'package 2': 22500,
  'package 3': 31500,
  newborn: 40000,
  wedding: 200000,
};

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() data: { description: keyof typeof packagePricing },
    @Req() request: Request,
  ) {
    try {
      const intent = await this.paymentsService.createIntent({
        ...data,
        amount: packagePricing[data.description],

        customer: (request.user as any).stripeId!,
      });

      return {
        success: true,
        clientSecret: intent.client_secret,
        id: intent.id,
        description: intent.description,
        amount: intent.amount,
      };
    } catch (err) {
      console.log(err);
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('update-intent')
  async updateIntent(
    @Body() body: { description: keyof typeof packagePricing },
    @Query() query,
  ) {
    const result = await this.paymentsService.updateIntent({
      id: query.id,
      description: body.description,
      amount: packagePricing[body.description],
    });

    return {
      success: true,
      clientSecret: result.client_secret,
      id: result.id,
      description: result.description,
      amount: result.amount,
    };
  }

  @Post('stripe-webhook')
  async paymentAcceptedWebhook(@Req() request) {
    return this.paymentsService.stripeWebhook(request.body);
  }

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(+id);
  }
}
