import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnColorTableAccount1750915781611 implements MigrationInterface {
    name = 'AddColumnColorTableAccount1750915781611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" ADD "color" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "color"`);
    }

}
