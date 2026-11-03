CREATE TABLE accounts (id TEXT PRIMARY KEY, login TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, recovery_hash TEXT NOT NULL, created INTEGER NOT NULL);
CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id), expires INTEGER NOT NULL);
CREATE INDEX sessions_owner ON sessions(account_id);
