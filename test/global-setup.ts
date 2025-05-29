import { execSync } from 'child_process';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { Client } from 'pg';

module.exports = async function () {
  const postgresContainer = await new PostgreSqlContainer(
    'postgres:16.1',
  ).start();

  process.env.DATABASE_URL = `${postgresContainer.getConnectionUri()}?connection_limit=1`;

  console.log(process.env.DATABASE_URL);

  const postgresClient = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  execSync(`DATABASE_URL="${process.env.DATABASE_URL}" npx prisma migrate dev`);

  await postgresClient.connect();

  await postgresClient.end();

  globalThis.__POSTGRES_CONTAINER__ = postgresContainer;
};
