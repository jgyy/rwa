import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as promClient from 'prom-client';

// Create a Registry
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics for RWA platform
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

const rwaUsersTotal = new promClient.Gauge({
  name: 'rwa_users_total',
  help: 'Total number of registered users',
});

const rwaAssetsTotal = new promClient.Gauge({
  name: 'rwa_assets_total',
  help: 'Total number of assets',
});

const rwaTransactionsTotal = new promClient.Counter({
  name: 'rwa_transactions_total',
  help: 'Total number of transactions',
  labelNames: ['type', 'status'],
});

const rwaBidsTotal = new promClient.Counter({
  name: 'rwa_bids_total',
  help: 'Total number of bids',
  labelNames: ['status'],
});

const ipfsOperations = new promClient.Counter({
  name: 'ipfs_operations_total',
  help: 'Total IPFS operations',
  labelNames: ['operation', 'status'],
});

const databaseQueryDuration = new promClient.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(rwaUsersTotal);
register.registerMetric(rwaAssetsTotal);
register.registerMetric(rwaTransactionsTotal);
register.registerMetric(rwaBidsTotal);
register.registerMetric(ipfsOperations);
register.registerMetric(databaseQueryDuration);

export async function metricsPlugin(fastify: FastifyInstance) {
  // Track HTTP requests
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.startTime = Date.now();
    activeConnections.inc();
  });

  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const duration = (Date.now() - (reply as any).startTime) / 1000;
    const labels = {
      method: request.method,
      route: request.routerPath || request.url,
      status: reply.statusCode.toString(),
    };
    
    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
    activeConnections.dec();
  });

  // Metrics endpoint
  fastify.get('/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.type('text/plain');
    return await register.metrics();
  });

  // Health check endpoint
  fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  });

  // Readiness check endpoint
  fastify.get('/ready', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Check database connection
      // await fastify.prisma.$queryRaw`SELECT 1`;
      
      // Check Redis connection
      // await fastify.redis.ping();
      
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      reply.code(503);
      return {
        status: 'not ready',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  });
}

// Export metrics for use in other modules
export const metrics = {
  httpRequestDuration,
  httpRequestTotal,
  activeConnections,
  rwaUsersTotal,
  rwaAssetsTotal,
  rwaTransactionsTotal,
  rwaBidsTotal,
  ipfsOperations,
  databaseQueryDuration,
};

// Helper function to update business metrics
export async function updateBusinessMetrics(prisma: any) {
  try {
    // Update user count
    const userCount = await prisma.user.count();
    rwaUsersTotal.set(userCount);

    // Update asset count
    const assetCount = await prisma.asset.count();
    rwaAssetsTotal.set(assetCount);

    // You can add more business metrics here
  } catch (error) {
    console.error('Error updating business metrics:', error);
  }
}

// Start periodic metrics update (every 30 seconds)
export function startMetricsCollection(prisma: any) {
  setInterval(() => {
    updateBusinessMetrics(prisma);
  }, 30000);
  
  // Initial update
  updateBusinessMetrics(prisma);
}