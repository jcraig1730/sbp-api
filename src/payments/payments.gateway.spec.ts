import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsGateway } from './payments.gateway';

describe('PaymentsGateway', () => {
  let gateway: PaymentsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentsGateway],
    }).compile();

    gateway = module.get<PaymentsGateway>(PaymentsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
