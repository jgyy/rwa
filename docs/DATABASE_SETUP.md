# Database Setup Guide

## Quick Start with Docker

```bash
# 1. Start PostgreSQL and Redis using Docker Compose
docker compose up -d postgres redis

# 2. Wait for services to be healthy
docker compose ps

# 3. Run database migrations
cd rwa-backend
npm run migrate

# 4. Seed the database with test data
npm run seed

# 5. Open Prisma Studio to view data
npm run studio
```

## Manual Setup

### PostgreSQL Setup

```bash
# Run PostgreSQL with Docker
docker run --name rwa-postgres \
  -e POSTGRES_USER=rwa_user \
  -e POSTGRES_PASSWORD=rwa_password \
  -e POSTGRES_DB=rwa_db \
  -p 5432:5432 \
  -d postgres:15-alpine

# Verify connection
docker exec -it rwa-postgres psql -U rwa_user -d rwa_db -c "SELECT version();"
```

### Redis Setup

```bash
# Run Redis with Docker
docker run --name rwa-redis \
  -p 6379:6379 \
  -d redis:alpine \
  redis-server --appendonly yes --requirepass rwa_redis_password

# Verify connection
docker exec -it rwa-redis redis-cli -a rwa_redis_password ping
```

## Database Operations

### Migrations

```bash
# Create a new migration
cd rwa-backend
npx prisma migrate dev --name your_migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npm run db:reset
```

### Seeding

```bash
# Run seed script
cd rwa-backend
npm run seed

# Or with Prisma
npx prisma db seed
```

### Database Management

```bash
# Open Prisma Studio (GUI for database)
cd rwa-backend
npm run studio
# Opens at http://localhost:5555

# Access PostgreSQL CLI
docker exec -it rwa-postgres psql -U rwa_user -d rwa_db

# Access PgAdmin (if using docker-compose)
# http://localhost:5050
# Email: admin@rwa.com
# Password: admin
```

## Database Schema

The database includes the following main tables:

- **User** - User accounts with authentication and roles
- **Asset** - Real world assets with tokenization info
- **Transaction** - Blockchain and platform transactions
- **Bid** - Bidding system for assets
- **KYCVerification** - KYC/AML compliance
- **Document** - Asset documentation (stored in IPFS)
- **Activity** - Audit log of all activities
- **Notification** - User notifications

## Connection Strings

### Development
```env
DATABASE_URL="postgresql://rwa_user:rwa_password@localhost:5432/rwa_db"
REDIS_URL="redis://:rwa_redis_password@localhost:6379"
```

### Docker
```env
DATABASE_URL="postgresql://rwa_user:rwa_password@postgres:5432/rwa_db"
REDIS_URL="redis://:rwa_redis_password@redis:6379"
```

### Production (example)
```env
DATABASE_URL="postgresql://user:password@your-db-host:5432/rwa_db?sslmode=require"
REDIS_URL="rediss://:password@your-redis-host:6379"
```

## Backup and Restore

### Backup

```bash
# Backup database
docker exec -t rwa-postgres pg_dump -U rwa_user rwa_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup with compression
docker exec -t rwa-postgres pg_dump -U rwa_user -F c rwa_db > backup_$(date +%Y%m%d_%H%M%S).dump
```

### Restore

```bash
# Restore from SQL
docker exec -i rwa-postgres psql -U rwa_user rwa_db < backup.sql

# Restore from dump
docker exec -i rwa-postgres pg_restore -U rwa_user -d rwa_db < backup.dump
```

## Troubleshooting

### Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check PostgreSQL logs
docker logs rwa-postgres

# Test connection
psql postgresql://rwa_user:rwa_password@localhost:5432/rwa_db
```

### Migration Issues

```bash
# Reset migrations
cd rwa-backend
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Format schema file
npx prisma format
```

### Performance Monitoring

```sql
-- Check database size
SELECT pg_database_size('rwa_db');

-- Check table sizes
SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, calls, mean_exec_time, max_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;
```

## Security Notes

1. **Change default passwords** in production
2. **Enable SSL/TLS** for database connections
3. **Use connection pooling** for better performance
4. **Regular backups** - automate daily backups
5. **Monitor database** performance and security
6. **Limit connections** from specific IPs in production
7. **Use read replicas** for scaling read operations