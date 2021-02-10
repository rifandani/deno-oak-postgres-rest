import { Client, Pool } from 'https://deno.land/x/postgres/mod.ts';
import { PoolClient } from 'https://deno.land/x/postgres/client.ts';

// const clientConfig = `postgres://user:password@localhost:5432/test?application_name=my_custom_app`;
const clientConfig = {
  applicationName: 'deno-oak-postgres',
  user: Deno.env.get('DB_USER'),
  password: Deno.env.get('DB_PASSWORD'),
  database: Deno.env.get('DB_NAME'),
  hostname: Deno.env.get('DB_HOST'),
  port: Deno.env.get('DB_PORT'),
};

// basic Client
const client = new Client(clientConfig);

// pooling
const POOL_CONNECTIONS = 20;
const dbPool = new Pool(clientConfig, POOL_CONNECTIONS);

// run query return object
async function runQueryObj(query: string) {
  const client: PoolClient = await dbPool.connect();
  const dbResult = await client.queryObject(query);
  await client.release();

  return dbResult;
}

// run query return array
async function runQueryArr(query: string) {
  const client: PoolClient = await dbPool.connect();
  const dbResult = await client.queryArray(query);
  await client.release();

  return dbResult;
}

export { client, dbPool, runQueryObj, runQueryArr };
