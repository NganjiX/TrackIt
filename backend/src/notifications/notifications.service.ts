import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessesService } from '../businesses/businesses.service';

/**
 * In-app notifications (read-only delivery for Release 1.0).
 */
@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessesService: BusinessesService,
  ) {}

  async findAll(userId: string) {
    const business = await this.businessesService.findByOwnerId(userId);
    if (!business) {
      return { data: [], unreadCount: 0 };
    }

    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId, businessId: business.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.notification.count({
        where: { userId, businessId: business.id, read: false },
      }),
    ]);

    return {
      data: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        link: n.link,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    };
  }

  async markRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException({
        message: 'Notification not found',
        errorCode: 'NOTIFICATION_NOT_FOUND',
      });
    }
    await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return { message: 'Notification marked as read' };
  }

  async markAllRead(userId: string) {
    const business = await this.businessesService.findByOwnerId(userId);
    if (!business) {
      return { message: 'No notifications' };
    }
    await this.prisma.notification.updateMany({
      where: { userId, businessId: business.id, read: false },
      data: { read: true },
    });
    return { message: 'All notifications marked as read' };
  }
}
