import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdToTaskLevels1774957835903 implements MigrationInterface {
  name = 'AddUserIdToTaskLevels1774957835903';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove the unique constraint on title so different users can share names
    await queryRunner.query(
      `ALTER TABLE \`task_levels\` DROP INDEX IF EXISTS \`IDX_task_levels_title\``,
    ).catch(() => { /* index may not exist under that name */ });

    // Try the TypeORM-generated unique index name
    await queryRunner.query(
      `ALTER TABLE \`task_levels\` DROP INDEX IF EXISTS \`IDX_f7d6f0d6a08a59e5a26e17f3b3\``,
    ).catch(() => {});

    // Generic DROP of any unique key on the title column (MySQL approach)
    await queryRunner.query(`
      SET @drop_idx = (
        SELECT CONCAT('ALTER TABLE task_levels DROP INDEX ', INDEX_NAME)
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'task_levels'
          AND COLUMN_NAME = 'title'
          AND NON_UNIQUE = 0
        LIMIT 1
      );
      PREPARE stmt FROM @drop_idx;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
    `).catch(() => { /* no unique index on title */ });

    // Add user_id column
    await queryRunner.query(
      `ALTER TABLE \`task_levels\` ADD \`user_id\` int NULL`,
    );

    // Add foreign key (cascade delete: removing a user removes their task levels)
    await queryRunner.query(
      `ALTER TABLE \`task_levels\` ADD CONSTRAINT \`FK_task_levels_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`task_levels\` DROP FOREIGN KEY \`FK_task_levels_user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`task_levels\` DROP COLUMN \`user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`task_levels\` ADD UNIQUE INDEX \`IDX_task_levels_title\` (\`title\`)`,
    );
  }
}
