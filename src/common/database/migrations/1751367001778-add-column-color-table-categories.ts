import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnColorTableCategories1751367001778 implements MigrationInterface {
    name = 'AddColumnColorTableCategories1751367001778'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD "color" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "color"`);
    }

}
