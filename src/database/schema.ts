import { db } from "./database.js";

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      multiplier REAL NOT NULL,
      occurred_at TEXT NOT NULL,
      duration_ms INTEGER,
      source TEXT NOT NULL DEFAULT 'unknown',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      round_id INTEGER,
      predicted_multiplier REAL NOT NULL,
      confidence REAL,
      model_name TEXT NOT NULL,
      predicted_at TEXT NOT NULL,
      actual_multiplier REAL,
      error REAL,
      is_correct INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (round_id) REFERENCES rounds(id)
    );

    CREATE TABLE IF NOT EXISTS prediction_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'ready',
      prediction_id INTEGER,
      round_id INTEGER,
      started_at TEXT,
      prediction_locked_at TEXT,
      result_received_at TEXT,
      evaluated_at TEXT,
      stopped_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
      FOREIGN KEY (prediction_id)
        REFERENCES predictions(id)
        ON DELETE SET NULL,
      FOREIGN KEY (round_id)
        REFERENCES rounds(id)
        ON DELETE SET NULL,
      CHECK (
        status IN (
          'ready',
          'active',
          'waiting_result',
          'evaluated',
          'stopped'
        )
      )
    );

    CREATE TABLE IF NOT EXISTS aviator_round_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      round_id INTEGER NOT NULL,
      provider_round_id TEXT NOT NULL,
      source TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (round_id)
        REFERENCES rounds(id)
        ON DELETE CASCADE,
      UNIQUE (source, provider_round_id)
    );

    CREATE INDEX IF NOT EXISTS idx_aviator_round_sources_round_id
      ON aviator_round_sources(round_id);

    CREATE INDEX IF NOT EXISTS idx_aviator_round_sources_provider_round_id
      ON aviator_round_sources(provider_round_id);

    CREATE INDEX IF NOT EXISTS idx_prediction_sessions_user_id
      ON prediction_sessions(user_id);

    CREATE INDEX IF NOT EXISTS idx_prediction_sessions_status
      ON prediction_sessions(status);

    CREATE INDEX IF NOT EXISTS idx_prediction_sessions_prediction_id
      ON prediction_sessions(prediction_id);

    CREATE INDEX IF NOT EXISTS idx_prediction_sessions_round_id
      ON prediction_sessions(round_id);

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (role IN ('user', 'admin')),
      CHECK (is_active IN (0, 1))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_token TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_token
      ON sessions(session_token);

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id
      ON sessions(user_id);

    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
      ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      event_type TEXT NOT NULL,
      event_message TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
      ON audit_logs(user_id);

    CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type
      ON audit_logs(event_type);

    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
      ON audit_logs(created_at);
  `);

  const roundColumns = db
    .prepare("PRAGMA table_info(rounds)")
    .all() as Array<{ name: string }>;

  const hasSourceColumn = roundColumns.some(
    (column) => column.name === "source"
  );

  if (!hasSourceColumn) {
    db.exec(`
      ALTER TABLE rounds
      ADD COLUMN source TEXT NOT NULL DEFAULT 'unknown'
    `);
  }
}
