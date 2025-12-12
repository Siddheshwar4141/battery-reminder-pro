import pkg from 'pg';
import { config } from './config.js';
import { logger } from './logger.js';

const { Pool } = pkg;

export const db = new Pool(config.db);

db.on('error', (err) => logger.error('Database error:', err));
