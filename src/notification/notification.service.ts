import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class NotificationService {
    constructor(
        private socketGateway: SocketGateway,
        @InjectRepository(NotificationEntity) private notificationRepository: Repository<NotificationEntity>,
    ) { }

    async getUnReadNotifications(userId: number): Promise<NotificationEntity[]> {
        return await this.notificationRepository.find({ where: { toId: userId, isRead: false }, relations: ['fromUser'], order: { createdAt: 'DESC' } });
    }

    async setReadNotification(id: number, userId: number): Promise<void> {
        await this.notificationRepository.update({ id: id, toId: userId }, { isRead: true });
        this.socketGateway.emitEvents(userId, 'notification-update', {});
    }

    async setReadAllNotifications(userId: number): Promise<void> {
        await this.notificationRepository.update({ toId: userId }, { isRead: true });
        this.socketGateway.emitEvents(userId, 'notification-update', {});
    }

}
