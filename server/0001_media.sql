CREATE TABLE media (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES profiles(user_id), type TEXT NOT NULL, data TEXT NOT NULL, created INTEGER NOT NULL);
CREATE INDEX media_owner ON media(user_id);
ALTER TABLE posts ADD COLUMN image TEXT;
