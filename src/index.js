import { fetchStaleLocks } from './dynamo.js';
import { db } from './db.js';
import { notifyUser } from './fcm.js';
import { logger } from './logger.js';

async function run() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  logger.info(`Processing locks not updated since ${cutoff.toISOString()}`);

  const staleLocks = await fetchStaleLocks(cutoff);
  logger.info(`Found ${staleLocks.length} stale locks`);

  for (const lock of staleLocks) {
    const lockId = lock.lock_id;

    const result = await db.query(
      'SELECT user_id, fcm_id FROM lock_user_mapping WHERE lock_id=$1',
      [lockId]
    );

    for (const user of result.rows) {
      await notifyUser(user.fcm_id, lockId);
      await db.query(
        'INSERT INTO notification_events (user_id, lock_id, sent_at) VALUES ($1,$2,NOW())',
        [user.user_id, lockId]
      );
      logger.info(`Notification logged for user ${user.user_id}`);
    }
  }

  logger.info('Job complete');
  process.exit(0);
}

run().catch(err => {
  logger.error(err);
  process.exit(1);
});
