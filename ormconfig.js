// TypeORM CLI

module.exports = {
  type: 'postgres',
  host: process.env.TYPEORM_HOST ? process.env.TYPEORM_HOST : 'localhost',
  port: process.env.TYPEORM_PORT ? Number(process.env.TYPEORM_PORT) : 5432,
  username: process.env.TYPEORM_USERNAME
    ? process.env.TYPEORM_USERNAME
    : 'root',
  password: process.env.TYPEORM_PASSWORD
    ? process.env.TYPEORM_PASSWORD
    : 'root',
  database:
    process.env.TYPEORM_DATABASE && process.env.NODE_ENV
      ? `${process.env.TYPEORM_DATABASE}_${process.env.NODE_ENV}`
      : 'mandabrejas_development',
  logging: process.env.NODE_ENV !== 'production',
  entities: [`${__dirname}/dist/entities/*.js`],
  migrations: [`${__dirname}/dist/migrations/*.js`],
  subscribers: [`${__dirname}/dist/subscribers/*.js`],
};
