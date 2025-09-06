-- RWA Platform Database Initialization Script

-- Create database if not exists (run as superuser)
-- CREATE DATABASE rwa_db;

-- Connect to rwa_db before running the rest

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types if needed
DO $$ BEGIN
    CREATE TYPE asset_category AS ENUM (
        'REAL_ESTATE',
        'COMMODITY',
        'EQUITY',
        'DEBT',
        'ART',
        'COLLECTIBLE',
        'INTELLECTUAL_PROPERTY',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance (these will be created by Prisma, but kept here for reference)
-- CREATE INDEX IF NOT EXISTS idx_users_email ON "User"(email);
-- CREATE INDEX IF NOT EXISTS idx_users_wallet ON "User"("walletAddress");
-- CREATE INDEX IF NOT EXISTS idx_assets_category ON "Asset"(category);
-- CREATE INDEX IF NOT EXISTS idx_assets_status ON "Asset"(status);
-- CREATE INDEX IF NOT EXISTS idx_transactions_hash ON "Transaction"("transactionHash");

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON DATABASE rwa_db TO rwa_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rwa_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rwa_user;

-- Performance tuning suggestions (optional)
-- ALTER DATABASE rwa_db SET shared_buffers = '256MB';
-- ALTER DATABASE rwa_db SET effective_cache_size = '1GB';
-- ALTER DATABASE rwa_db SET maintenance_work_mem = '64MB';
-- ALTER DATABASE rwa_db SET checkpoint_completion_target = 0.9;
-- ALTER DATABASE rwa_db SET wal_buffers = '16MB';
-- ALTER DATABASE rwa_db SET default_statistics_target = 100;
-- ALTER DATABASE rwa_db SET random_page_cost = 1.1;