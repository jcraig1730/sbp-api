import { Inject, Injectable } from '@nestjs/common';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import Stripe from 'stripe';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PaymentsGateway } from './payments.gateway';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PaymentsService {
  stripe: Stripe;
  endpointSecret: string;
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private paymentsGateway: PaymentsGateway,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_PRIVATE_KEY'), {
      apiVersion: '2023-08-16',
    });
    this.endpointSecret = this.configService.get('STRIPE_ENDPOINT_SECRET');
  }

  async createIntent(data: {
    amount: number;
    description: string;
    customer: string;
  }) {
    return this.stripe.paymentIntents.create({
      ...data,
      description: data.description.toLowerCase(),
      currency: 'usd',
    });
  }

  updateIntent(data: { id: string; amount: number; description: string }) {
    return this.stripe.paymentIntents.update(data.id, {
      amount: data.amount,
      description: data.description.toLowerCase(),
    });
  }

  getIntentById(id: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(id);
  }

  createPaymentUser(customerParams: Stripe.CustomerCreateParams) {
    return this.stripe.customers.create(customerParams);
  }

  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }

  async stripeWebhook(paymentIntent: any) {
    const intentId = paymentIntent.data.object.id;
    const idempotencyKey = paymentIntent.request.idempotency_key;
    const isRepeat = await this.cacheManager.get(idempotencyKey);
    if (isRepeat) return;
    this.cacheManager.set(idempotencyKey, idempotencyKey);
    if (paymentIntent.type === 'payment_intent.succeeded') {
      this.paymentsGateway.emitSuccess(intentId);
    }
    if (paymentIntent.type === 'payment_intent.payment_failed') {
      this.paymentsGateway.emitFail(intentId);
    }
    if (paymentIntent.type === 'payment_intent.canceled') {
      this.paymentsGateway.emitFail(intentId);
    }
  }
}
