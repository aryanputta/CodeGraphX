-- CodeGraphX 2.0 — PostgreSQL schema

CREATE TABLE IF NOT EXISTS repos (
    id          SERIAL PRIMARY KEY,
    repo_name   VARCHAR(255) UNIQUE NOT NULL,
    repo_url    TEXT NOT NULL,
    branch      VARCHAR(100) DEFAULT 'HEAD',
    status      VARCHAR(50)  DEFAULT 'pending',
    node_count  INT          DEFAULT 0,
    edge_count  INT          DEFAULT 0,
    top_risk    FLOAT        DEFAULT 0.0,
    created_at  TIMESTAMPTZ  DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_name   VARCHAR(255) REFERENCES repos(repo_name),
    status      VARCHAR(50)  DEFAULT 'pending',
    error       TEXT,
    created_at  TIMESTAMPTZ  DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS node_predictions (
    id          SERIAL PRIMARY KEY,
    repo_name   VARCHAR(255) REFERENCES repos(repo_name),
    node_id     VARCHAR(255) NOT NULL,
    risk_score  FLOAT NOT NULL,
    label       VARCHAR(50)  NOT NULL,
    created_at  TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE(repo_name, node_id)
);

CREATE INDEX IF NOT EXISTS idx_predictions_repo ON node_predictions(repo_name);
CREATE INDEX IF NOT EXISTS idx_jobs_repo        ON jobs(repo_name);
