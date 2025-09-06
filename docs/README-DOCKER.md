# Docker Setup for RWA Platform

## Quick Start

1. **Copy environment file**
```bash
cp .env.docker .env
# Edit .env with your actual values
```

2. **Build and start all services**
```bash
docker compose up -d
```

3. **Check services status**
```bash
docker compose ps
```

## Services & Ports

| Service | Port | Description | URL |
|---------|------|-------------|-----|
| Frontend | 3000 | Next.js Application | http://localhost:3000 |
| Backend | 3001 | Fastify API | http://localhost:3001 |
| PostgreSQL | 5432 | Database | - |
| Redis | 6379 | Cache & Queue | - |
| IPFS | 5001, 8080 | IPFS API & Gateway | http://localhost:8080 |
| Hardhat | 8545 | Local Blockchain | http://localhost:8545 |
| Nginx | 80, 443 | Reverse Proxy | http://localhost |
| Prometheus | 9090 | Metrics | http://localhost:9090 |
| Grafana | 3002 | Monitoring Dashboard | http://localhost:3002 |
| PgAdmin | 5050 | Database Admin | http://localhost:5050 |
| Portainer | 9000 | Container Management | http://localhost:9000 |

## Common Commands

### Start services
```bash
# Start all services
docker compose up -d

# Start specific service
docker compose up -d backend

# View logs
docker compose logs -f backend
```

### Stop services
```bash
# Stop all services
docker compose down

# Stop and remove volumes (full reset)
docker compose down -v
```

### Development
```bash
# Rebuild after code changes
docker compose build backend
docker compose up -d backend

# Execute commands in container
docker compose exec backend npm run migrate
docker compose exec hardhat npx hardhat compile
```

### Database operations
```bash
# Run migrations
docker compose exec backend npx prisma migrate dev

# Access PostgreSQL
docker compose exec postgres psql -U rwa_user -d rwa_db

# Backup database
docker compose exec postgres pg_dump -U rwa_user rwa_db > backup.sql
```

### Monitoring
```bash
# View container stats
docker stats

# Access Grafana dashboard
# URL: http://localhost:3002
# User: admin / Password: admin (change in .env)

# Access Portainer
# URL: http://localhost:9000
```

## Environment Variables

Edit `.env` file to configure:
- Database credentials
- JWT secrets
- API keys (Alchemy, WalletConnect)
- Service passwords

## Volumes

Persistent data is stored in named volumes:
- `rwa-postgres-data` - Database data
- `rwa-redis-data` - Redis persistence
- `rwa-ipfs-data` - IPFS storage
- `rwa-hardhat-data` - Blockchain data
- `rwa-grafana-data` - Grafana dashboards
- `rwa-prometheus-data` - Metrics data

## Troubleshooting

### Service won't start
```bash
# Check logs
docker compose logs service-name

# Rebuild image
docker compose build --no-cache service-name
```

### Database connection issues
```bash
# Check if postgres is healthy
docker compose ps postgres

# Test connection
docker compose exec postgres pg_isready -U rwa_user
```

### Reset everything
```bash
docker compose down -v
docker system prune -a
docker compose up -d
```

## Production Deployment

1. Update `.env` with production values
2. Enable SSL in nginx configuration
3. Use proper secrets and passwords
4. Consider using Docker Swarm or Kubernetes
5. Set up proper backup strategies
6. Configure monitoring alerts