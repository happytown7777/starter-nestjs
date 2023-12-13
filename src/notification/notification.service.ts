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
        return await this.notificationRepository.find({ where: { userId, isRead: false } });
    }

    async setReadNotification(id: number, userId: number): Promise<void> {
        await this.notificationRepository.update({ id, userId }, { isRead: true });
        this.socketGateway.emitEvents(userId, 'notification-update', { });
    }

    async setReadAllNotifications(userId: number): Promise<void> {
        await this.notificationRepository.update({ userId }, { isRead: true });
        this.socketGateway.emitEvents(userId, 'notification-update', { });
    }

}
