import 'dotenv/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

import { type Migration, type MigrationProvider, Migrator } from 'kysely/migration';

import { db } from './db.js';

class CustomMigrationProvider implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    const migrations: Record<string, Migration> = {};
    const migrationFolder = path.join(import.meta.dirname, 'migrations');
    const files = await fs.readdir(migrationFolder);

    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const filePath = path.join(migrationFolder, file);
        const migration = await import(pathToFileURL(filePath).href);
        const key = file.replace(/\.(ts|js)$/, '');
        migrations[key] = migration;
      }
    }

    return migrations;
  }
}

const migrator = new Migrator({
  db,
  provider: new CustomMigrationProvider(),
});

const { error, results } = await migrator.migrateToLatest();

results?.forEach((it) => {
  if (it.status === 'Success') {
    console.log(`migration "${it.migrationName}" was executed successfully`);
  } else if (it.status === 'Error') {
    console.error(`failed to execute migration "${it.migrationName}"`);
  }
});

if (error) {
  console.error('failed to migrate');
  console.error(error);
  process.exit(1);
}

await db.destroy();
