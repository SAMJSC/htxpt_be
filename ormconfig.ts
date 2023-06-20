import dotenv from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";

dotenv.config();

const databaseHost = process.env.DATABASE_HOST;
const databasePort = Number(process.env.DATABASE_PORT);
const databaseUser = process.env.DATABASE_USER;
const databasePassword = process.env.DATABASE_PASSWORD;
const databaseName = process.env.DATABASE;

if (
    !databaseHost ||
    !databasePort ||
    !databaseUser ||
    !databasePassword ||
    !databaseName
) {
    throw new Error("Missing or invalid database environment variables");
}

export const dataSource = new DataSource({
    type: "mysql",
    host: databaseHost,
    port: databasePort,
    username: databaseUser,
    password: databasePassword,
    database: databaseName,
    migrations: ["dist/src/database/migrations/*{.ts,.js}"],
    entities: ["dist/src/entities/*.entity{.ts,.js}"],
    synchronize: true,
});
