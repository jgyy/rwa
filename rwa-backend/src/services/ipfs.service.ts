import { create, KuboRPCClient } from 'kubo-rpc-client';
import { FastifyInstance } from 'fastify';

export interface IPFSService {
  client: KuboRPCClient;
  uploadFile: (content: Buffer | string, fileName?: string) => Promise<string>;
  uploadJSON: (data: any) => Promise<string>;
  getFile: (cid: string) => Promise<Buffer>;
  getJSON: (cid: string) => Promise<any>;
  pinFile: (cid: string) => Promise<void>;
  unpinFile: (cid: string) => Promise<void>;
  getGatewayUrl: (cid: string) => string;
}

export function createIPFSService(
  apiUrl: string = process.env.IPFS_API_URL || 'http://localhost:5001',
  gatewayUrl: string = process.env.IPFS_GATEWAY_URL || 'http://localhost:8080'
): IPFSService {
  // Create IPFS client
  const client = create({ url: apiUrl });

  return {
    client,

    /**
     * Upload a file to IPFS
     */
    async uploadFile(content: Buffer | string, fileName?: string): Promise<string> {
      try {
        const file = {
          path: fileName || 'file',
          content: typeof content === 'string' ? Buffer.from(content) : content,
        };

        const result = await client.add(file, {
          pin: true,
          wrapWithDirectory: false,
        });

        return result.cid.toString();
      } catch (error) {
        throw new Error(`Failed to upload file to IPFS: ${error.message}`);
      }
    },

    /**
     * Upload JSON data to IPFS
     */
    async uploadJSON(data: any): Promise<string> {
      try {
        const jsonString = JSON.stringify(data, null, 2);
        return await this.uploadFile(jsonString, 'metadata.json');
      } catch (error) {
        throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
      }
    },

    /**
     * Retrieve a file from IPFS
     */
    async getFile(cid: string): Promise<Buffer> {
      try {
        const chunks: Uint8Array[] = [];
        
        for await (const chunk of client.cat(cid)) {
          chunks.push(chunk);
        }

        return Buffer.concat(chunks);
      } catch (error) {
        throw new Error(`Failed to retrieve file from IPFS: ${error.message}`);
      }
    },

    /**
     * Retrieve JSON data from IPFS
     */
    async getJSON(cid: string): Promise<any> {
      try {
        const buffer = await this.getFile(cid);
        const jsonString = buffer.toString('utf-8');
        return JSON.parse(jsonString);
      } catch (error) {
        throw new Error(`Failed to retrieve JSON from IPFS: ${error.message}`);
      }
    },

    /**
     * Pin a file to prevent garbage collection
     */
    async pinFile(cid: string): Promise<void> {
      try {
        await client.pin.add(cid);
      } catch (error) {
        throw new Error(`Failed to pin file: ${error.message}`);
      }
    },

    /**
     * Unpin a file to allow garbage collection
     */
    async unpinFile(cid: string): Promise<void> {
      try {
        await client.pin.rm(cid);
      } catch (error) {
        throw new Error(`Failed to unpin file: ${error.message}`);
      }
    },

    /**
     * Get the gateway URL for a CID
     */
    getGatewayUrl(cid: string): string {
      return `${gatewayUrl}/ipfs/${cid}`;
    },
  };
}

/**
 * Fastify plugin for IPFS
 */
export async function ipfsPlugin(fastify: FastifyInstance) {
  const ipfsService = createIPFSService();
  
  // Decorate fastify instance with IPFS service
  fastify.decorate('ipfs', ipfsService);
  
  // Add IPFS routes
  fastify.register(async function (fastify) {
    // Upload file endpoint
    fastify.post('/ipfs/upload', async (request, reply) => {
      const { content, fileName } = request.body as { content: string; fileName?: string };
      
      try {
        const cid = await ipfsService.uploadFile(content, fileName);
        const gatewayUrl = ipfsService.getGatewayUrl(cid);
        
        return reply.send({
          success: true,
          cid,
          gatewayUrl,
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    });

    // Upload JSON endpoint
    fastify.post('/ipfs/upload-json', async (request, reply) => {
      const data = request.body;
      
      try {
        const cid = await ipfsService.uploadJSON(data);
        const gatewayUrl = ipfsService.getGatewayUrl(cid);
        
        return reply.send({
          success: true,
          cid,
          gatewayUrl,
        });
      } catch (error) {
        return reply.code(500).send({
          success: false,
          error: error.message,
        });
      }
    });

    // Retrieve file endpoint
    fastify.get('/ipfs/:cid', async (request, reply) => {
      const { cid } = request.params as { cid: string };
      
      try {
        const content = await ipfsService.getFile(cid);
        return reply.type('application/octet-stream').send(content);
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: 'File not found',
        });
      }
    });

    // Retrieve JSON endpoint
    fastify.get('/ipfs/json/:cid', async (request, reply) => {
      const { cid } = request.params as { cid: string };
      
      try {
        const data = await ipfsService.getJSON(cid);
        return reply.send(data);
      } catch (error) {
        return reply.code(404).send({
          success: false,
          error: 'JSON not found',
        });
      }
    });
  });
}

// Module augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    ipfs: IPFSService;
  }
}