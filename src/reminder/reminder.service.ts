import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { SocketGateway } from 'src/socket/socket.gateway';
import { Diary } from 'src/diary/entities/diary.entity';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { Settings } from 'src/settings/entities/settings.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReminderService {
    constructor(
        private socketGateway: SocketGateway,
        @InjectRepository(Settings) private settingsRepository: Repository<Settings>,
        @InjectRepository(Diary) private diaryRepository: Repository<Diary>,
        @InjectRepository(NotificationEntity) private notificationRepository: Repository<NotificationEntity>,
    ) { }

    private readonly logger = new Logger(ReminderService.name);

    @Cron(CronExpression.EVERY_DAY_AT_8PM)
    async handleCron() {
        this.logger.debug('Called when the current second is 0');
        const settings = await this.settingsRepository.find({ where: { allow_reminder: true } });
        for(let i = 0; i < settings.length; i++) {
            if (settings[i]?.allow_notification && settings[i]?.allow_reminder) {
                const todayDiary = await this.diaryRepository.count({ where: { userId: settings[i].userId, date: new Date() } });
                if (todayDiary == 0) {
                    await this.notificationRepository.save({
                        fromId: settings[i].userId,
                        toId: settings[i].userId,
                        type: 'comment',
                        content: 'Just a friendly reminder to capture your thoughts and experiences in your diary today. Your insights are valuable!',
                        url: '/dashboard?post=true',
                    });
                    this.socketGateway.emitEvents(settings[i].userId.toString(), 'reminder', {});
                }
            }
        }
    }

}
