import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentsGateway } from './payments.gateway';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register()],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsGateway, CacheModule],
  exports: [PaymentsService, PaymentsGateway],
})
export class PaymentsModule {}
