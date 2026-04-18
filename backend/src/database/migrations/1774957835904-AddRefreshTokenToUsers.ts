import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenToUsers1774957835904 implements MigrationInterface {
  name = 'AddRefreshTokenToUsers1774957835904';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`refresh_token\` text NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`refresh_token\``,
    );
  }
}
