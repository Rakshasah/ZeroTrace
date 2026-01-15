import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const startCleanupTask = () => {
    console.info('[SYSTEM] cleanup_task_init: active');

    // Interval: 60s
    // Prunes messages where expiresAt < NOW()
    setInterval(async () => {
        try {
            const result = await prisma.message.deleteMany({
                where: {
                    expiresAt: { lt: new Date() }
                }
            });

            if (result.count > 0) {
                console.info(`[CLEANUP] Pruned ${result.count} expired records.`);
            }
        } catch (err) {
            console.error('[CLEANUP] Error during cycle:', err);
        }
    }, 60000);
};
