import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1719923957972 implements MigrationInterface {
  name = 'CreateUserTable1719923957972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "picture" character varying, "password" character varying, "password_confirm" character varying, "password_changed_at" TIMESTAMP WITH TIME ZONE, "hashed_refresh_token" character varying, "is_via_provider" boolean NOT NULL DEFAULT false, "password_reset_token" character varying, "password_reset_expires" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
