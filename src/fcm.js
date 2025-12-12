import admin from 'firebase-admin';
import fs from 'fs';
import { config } from './config.js';
import { logger } from './logger.js';

let initialized = false;

function init() {
  if (initialized) return;
  const raw = fs.readFileSync(config.firebaseCredPath, 'utf8');
  const credential = JSON.parse(raw);
  admin.initializeApp({ credential: admin.credential.cert(credential) });
  initialized = true;
}

export async function notifyUser(token, lockId) {
  init();
  const payload = {
    token,
    notification: {
      title: 'Battery Check Needed',
      body: `Your lock ${lockId} has not been checked recently.`
    },
    data: {
      event: 'battery_check_prompt',
      lock_id: String(lockId)
    }
  };

  try {
    const res = await admin.messaging().send(payload);
    return res;
  } catch (err) {
    logger.error('FCM error:', err);
    throw err;
  }
}
