import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserEntityTable1624219895231 implements MigrationInterface {
    name = 'createUserEntityTable1624219895231';
    
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`users\`
            (
                \`id\` CHAR(36) NOT NULL DEFAULT (uuid()),
                \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`middle_name\` VARCHAR(255),
                \`address\` VARCHAR(255),
                \`age\` INT,
                \`gender\` ENUM('MALE', 'FEMALE', 'OTHER'),
                \`user_name\` VARCHAR(255),
                \`password\` VARCHAR(255),
                \`reset_token\` VARCHAR(255),
                \`first_name\` VARCHAR(255),
                \`last_name\` VARCHAR(255) NOT NULL,
                \`role\` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
                \`email\` VARCHAR(255),
                \`date_of_birth\` DATE,
                \`phone\` VARCHAR(255),
                \`avatar\` VARCHAR(255),
                PRIMARY KEY (\`id\`),
                UNIQUE (\`email\`)
            )`);
        await queryRunner.query(`
            CREATE TABLE \`devices_session\`
            (
                \`id\` CHAR(36) NOT NULL DEFAULT (uuid()),
                \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`device_id\` VARCHAR(255),
                \`name\` VARCHAR(255),
                \`ua\` VARCHAR(255),
                \`refresh_token\` LONGTEXT,
                \`expired_at\` TIMESTAMP,
                \`ip_address\` VARCHAR(255),
                \`user_id\` CHAR(36),
                PRIMARY KEY (\`id\`),
                FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`)
            )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('devices_session');
        await queryRunner.dropTable('users');
    }
}
