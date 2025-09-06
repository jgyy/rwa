# Monitoring Setup Guide

## Overview

The RWA platform includes comprehensive monitoring with Prometheus, Grafana, and various exporters for all services.

## Quick Start

### Using Docker Compose

```bash
# Start all services including monitoring
docker compose up -d

# Or start only monitoring services
docker compose up -d prometheus grafana

# With additional exporters
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### Access Monitoring Services

| Service | URL | Default Credentials |
|---------|-----|-------------------|
| Grafana | http://localhost:3002 | admin / admin |
| Prometheus | http://localhost:9090 | No auth |
| Alertmanager | http://localhost:9093 | No auth |
| Node Exporter | http://localhost:9100/metrics | No auth |

## Components

### Prometheus
- **Port**: 9090
- **Config**: `monitoring/prometheus.yml`
- **Data**: Stored in Docker volume `rwa-prometheus-data`
- Scrapes metrics from all services every 15 seconds

### Grafana
- **Port**: 3002 (changed from 3000 to avoid conflict with frontend)
- **Config**: `monitoring/grafana/`
- **Dashboards**: Auto-provisioned from `monitoring/grafana/dashboards/`
- Pre-configured with Prometheus datasource

### Exporters

#### Backend Metrics (prom-client)
- **Endpoint**: http://localhost:3001/metrics
- Custom metrics for RWA platform:
  - Request rate and duration
  - Active connections
  - User/Asset/Transaction counts
  - IPFS operations
  - Database query performance

#### PostgreSQL Exporter
- **Port**: 9187
- Monitors database performance, connections, and queries

#### Redis Exporter
- **Port**: 9121
- Tracks cache hit rates, memory usage, and operations

#### Node Exporter
- **Port**: 9100
- System metrics (CPU, memory, disk, network)

## Available Dashboards

### RWA Platform Overview
- API request rates and response times
- Total users, assets, and transactions
- Database connections
- Redis memory usage
- Recent errors

Access at: http://localhost:3002/d/rwa-overview

## Metrics Available

### Application Metrics
```
# HTTP Metrics
http_requests_total
http_request_duration_seconds
active_connections

# Business Metrics
rwa_users_total
rwa_assets_total
rwa_transactions_total
rwa_bids_total

# IPFS Metrics
ipfs_operations_total

# Database Metrics
database_query_duration_seconds
pg_stat_database_*
```

### System Metrics
```
# Node Exporter
node_cpu_seconds_total
node_memory_*
node_filesystem_*
node_network_*

# Process Metrics
process_cpu_seconds_total
process_resident_memory_bytes
```

## Setting Up Alerts

### Configure Alertmanager

1. Edit `monitoring/alertmanager/config.yml`:
```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'email-notifications'

receivers:
  - name: 'email-notifications'
    email_configs:
      - to: 'admin@rwa.com'
        from: 'alerts@rwa.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'your-email@gmail.com'
        auth_password: 'your-app-password'
```

2. Restart Alertmanager:
```bash
docker compose restart alertmanager
```

### Available Alerts

- **HighErrorRate**: API error rate > 5%
- **SlowAPIResponse**: p95 response time > 2s
- **HighDatabaseConnections**: > 80 connections
- **HighRedisMemoryUsage**: > 90% memory used
- **ServiceDown**: Any service is down
- **HighCPUUsage**: CPU > 80%
- **HighTransactionFailureRate**: > 10% failed transactions
- **IPFSOperationFailures**: > 5% IPFS failures

## Adding Custom Metrics

### Backend (Fastify)

```typescript
import { metrics } from './plugins/metrics.plugin';

// Count operations
metrics.rwaTransactionsTotal.inc({ type: 'MINT', status: 'COMPLETED' });

// Measure duration
const timer = metrics.databaseQueryDuration.startTimer({ operation: 'SELECT', table: 'users' });
// ... perform query
timer();

// Update gauge
metrics.rwaUsersTotal.set(userCount);
```

### Frontend Metrics

Use backend API to push metrics:
```typescript
// Track user actions
await fetch('/api/metrics/track', {
  method: 'POST',
  body: JSON.stringify({
    event: 'wallet_connected',
    properties: { chain: 'ethereum' }
  })
});
```

## Querying Metrics

### Prometheus Queries

```promql
# Request rate per second
rate(http_requests_total[5m])

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate percentage
rate(http_requests_total{status=~"5.."}[5m]) * 100

# Active users in last hour
increase(rwa_users_total[1h])

# Transaction success rate
sum(rate(rwa_transactions_total{status="COMPLETED"}[5m])) / 
sum(rate(rwa_transactions_total[5m])) * 100
```

## Creating Custom Dashboards

1. Access Grafana: http://localhost:3002
2. Click "+" → "Dashboard" → "Add new panel"
3. Select Prometheus datasource
4. Enter query and configure visualization
5. Save dashboard to persist changes

### Example Panel Configurations

**API Performance Panel**:
- Type: Graph
- Query: `rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])`
- Legend: Average Response Time
- Unit: seconds

**Asset Growth Panel**:
- Type: Stat
- Query: `increase(rwa_assets_total[24h])`
- Title: New Assets (24h)
- Color: Green

## Log Aggregation (Optional)

### Setup Loki & Promtail

```bash
# Start log aggregation stack
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d loki promtail
```

### View Logs in Grafana
1. Add Loki datasource: http://loki:3100
2. Use Explore tab to query logs
3. Example queries:
   - `{container="rwa-backend"} |= "error"`
   - `{container="rwa-frontend"} |~ "wallet.*connected"`

## Performance Tuning

### Prometheus Storage
```yaml
# Increase retention (docker-compose.yml)
command:
  - '--storage.tsdb.retention.time=30d'
  - '--storage.tsdb.retention.size=10GB'
```

### Grafana Performance
```yaml
# Increase limits (docker-compose.yml)
environment:
  GF_SERVER_ROUTER_LOGGING: false
  GF_DATABASE_MAX_OPEN_CONN: 100
```

## Troubleshooting

### Check Service Health
```bash
# Prometheus targets
curl http://localhost:9090/api/v1/targets

# Grafana health
curl http://localhost:3002/api/health

# Backend metrics
curl http://localhost:3001/metrics
```

### Common Issues

**No data in Grafana**:
- Check Prometheus targets are UP
- Verify datasource configuration
- Check time range in dashboard

**High memory usage**:
- Reduce Prometheus retention
- Decrease scrape frequency
- Enable metric cardinality limits

**Missing metrics**:
- Ensure service is exposing /metrics endpoint
- Check Prometheus scrape configuration
- Verify network connectivity

## Security Considerations

1. **Authentication**: Enable in production
   - Grafana: Change default password
   - Prometheus: Use reverse proxy with auth
   
2. **Network**: Restrict access
   - Use firewall rules
   - VPN for remote access
   
3. **Data**: Encrypt sensitive metrics
   - Use TLS for scraping
   - Encrypt storage volumes

## Maintenance

### Backup Grafana Dashboards
```bash
# Export dashboards
docker exec rwa-grafana grafana-cli admin export-dashboard-json

# Backup database
docker exec rwa-grafana tar czf /tmp/grafana-backup.tar.gz /var/lib/grafana
docker cp rwa-grafana:/tmp/grafana-backup.tar.gz ./
```

### Update Monitoring Stack
```bash
# Pull latest images
docker compose pull prometheus grafana

# Restart with new versions
docker compose up -d prometheus grafana
```