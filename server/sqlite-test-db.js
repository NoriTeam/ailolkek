import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
export function createDatabase(filename = ":memory:") {
  const sqlite = new DatabaseSync(filename);
  sqlite.exec("PRAGMA foreign_keys=ON");
  if (
    !sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='profiles'",
      )
      .get()
  )
    sqlite.exec(
      readFileSync(new URL("./0000_online.sql", import.meta.url), "utf8"),
    );
  if (
    !sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='media'",
      )
      .get()
  )
    sqlite.exec(
      readFileSync(new URL("./0001_media.sql", import.meta.url), "utf8"),
    );
  if (
    !sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='accounts'",
      )
      .get()
  )
    sqlite.exec(
      readFileSync(new URL("./0002_accounts.sql", import.meta.url), "utf8"),
    );
  return {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async first() {
              return sqlite.prepare(sql).get(...args) || null;
            },
            async all() {
              return { results: sqlite.prepare(sql).all(...args) };
            },
            async run() {
              let r = sqlite.prepare(sql).run(...args);
              return { success: true, meta: { changes: Number(r.changes) } };
            },
            execute() {
              return sqlite.prepare(sql).run(...args);
            },
          };
        },
      };
    },
    async batch(statements) {
      sqlite.exec("BEGIN IMMEDIATE");
      try {
        let out = statements.map((s) => s.execute());
        sqlite.exec("COMMIT");
        return out;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
    close() {
      sqlite.close();
    },
  };
}
