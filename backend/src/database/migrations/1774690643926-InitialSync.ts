import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from "typeorm";

export class InitialSyncClean implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        // 🔹 USERS
        await queryRunner.createTable(
            new Table({
                name: "users",
                columns: [
                    { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                    { name: "name", type: "varchar" },
                    { name: "email", type: "varchar", isUnique: true },
                    { name: "mobile", type: "varchar", isNullable: true },
                    { name: "password", type: "varchar", isNullable: true },
                    { name: "google_id", type: "varchar", isNullable: true },
                    { name: "provider", type: "varchar", default: "'local'" },
                    { name: "profile_picture", type: "varchar", isNullable: true },
                    { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
                    { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" },
                ],
            })
        );

        // 🔹 ROLES
        await queryRunner.createTable(
            new Table({
                name: "roles",
                columns: [
                    { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                    { name: "name", type: "varchar", isUnique: true },
                ],
            })
        );

        // 🔹 PERMISSIONS
        await queryRunner.createTable(
            new Table({
                name: "permissions",
                columns: [
                    { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                    { name: "name", type: "varchar", isUnique: true },
                ],
            })
        );

        // 🔹 TASK LEVELS
        await queryRunner.createTable(
            new Table({
                name: "task_levels",
                columns: [
                    { name: "id", type: "int", isPrimary: true, isGenerated: true },
                    { name: "title", type: "varchar", isUnique: true },
                ],
            })
        );

        // 🔹 TASKS
        await queryRunner.createTable(
            new Table({
                name: "tasks",
                columns: [
                    { name: "id", type: "int", isPrimary: true, isGenerated: true },
                    { name: "user_id", type: "int" },
                    { name: "description", type: "text" },
                    { name: "task_level_id", type: "int", isNullable: true }, // ✅ FIXED
                    { name: "status", type: "varchar", default: "'PENDING'" }, // ✅ avoid ENUM
                    { name: "date", type: "date" },
                    { name: "start_time", type: "time" },
                    { name: "end_time", type: "time" },
                ],
            })
        );

        // 🔗 FOREIGN KEYS

        await queryRunner.createForeignKey(
            "tasks",
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedTableName: "users",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "tasks",
            new TableForeignKey({
                columnNames: ["task_level_id"],
                referencedTableName: "task_levels",
                referencedColumnNames: ["id"],
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("tasks");
        await queryRunner.dropTable("task_levels");
        await queryRunner.dropTable("permissions");
        await queryRunner.dropTable("roles");
        await queryRunner.dropTable("users");
    }
}