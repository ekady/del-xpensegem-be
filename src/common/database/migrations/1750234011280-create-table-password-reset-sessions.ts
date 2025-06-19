import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTablePasswordResetSessions1750234011280 implements MigrationInterface {
    name = 'CreateTablePasswordResetSessions1750234011280'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "password_reset_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "used" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_b34e4be74df5a8b8875ea627dbe" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "password_reset_sessions"`);
    }

}
