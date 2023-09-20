import { Injectable } from '@nestjs/common';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import Stripe from 'stripe';
import { Request } from 'express';

@Injectable()
export class PaymentsService {
  stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY, {
    apiVersion: '2023-08-16',
  });
  private readonly endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

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

  onPaymentSuccess(request: Request) {
    const sig = request.headers['stripe-signature'];
    let event;

    try {
      event = this.stripe.webhooks.constructEvent(
        request.body,
        sig,
        this.endpointSecret,
      );
    } catch (err) {
      console.log({ err });
      return;
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object;

        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }
}
