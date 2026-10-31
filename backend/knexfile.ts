import type { Knex } from 'knex';
import { getDatabaseConfig } from './src/config/database.js';

const config: Knex.Config = getDatabaseConfig();

export default config;
