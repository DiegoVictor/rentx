import { Connection, createConnection, getConnectionOptions } from 'typeorm';

export default async (): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();
  let connection: Connection;

  if (!connection) {
    connection = await createConnection(
      Object.assign(defaultOptions, {
        database:
          process.env.NODE_ENV === 'test' ? 'test' : defaultOptions.database,
      })
    );
  }

  return connection;
};
