import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Cache } from 'cache-manager';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class PaymentsGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  afterInit(server: any) {}

  async handleConnection(client: Socket, ...args: any[]) {
    const clientId = client.id;
    const intentId = client.handshake.query.id as string;
    await this.cacheManager.set(intentId, clientId);
    const c = await this.cacheManager.get(intentId);
    client.join(clientId);
  }

  async emitSuccess(intentId: string) {
    const socketClientId: string = await this.cacheManager.get(intentId);
    let response = await this.server.to(socketClientId).emit('payment-success');
  }

  async emitFail(intentId: string) {
    const socketClientId: string = await this.cacheManager.get(intentId);
    let response = await this.server.to(socketClientId).emit('payment-failure');
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): string {
    this.server.emit('test-event', { success: true });
    return 'Hello world!';
  }
}
