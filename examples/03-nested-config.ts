import { compress, decompress } from 'ctx-compressor';
import { printResult } from './_print.js';

const config = {
  services: {
    authService: {
      host: 'internal.company.io',
      port: 4001,
      protocol: 'https',
      region: 'us-east-1',
      timeout: 5000,
      retries: 3,
    },
    paymentService: {
      host: 'internal.company.io',
      port: 4002,
      protocol: 'https',
      region: 'us-east-1',
      timeout: 8000,
      retries: 5,
    },
    notificationService: {
      host: 'internal.company.io',
      port: 4003,
      protocol: 'https',
      region: 'eu-west-1',
      timeout: 3000,
      retries: 3,
    },
    analyticsService: {
      host: 'internal.company.io',
      port: 4004,
      protocol: 'https',
      region: 'us-east-1',
      timeout: 10000,
      retries: 2,
    },
  },
  database: {
    primary: {
      host: 'db-primary.company.io',
      port: 5432,
      engine: 'postgres',
      ssl: true,
    },
    replica: {
      host: 'db-replica.company.io',
      port: 5432,
      engine: 'postgres',
      ssl: true,
    },
  },
};

const compressed = compress(config);
printResult('Example 03 — Nested config object (generic mode, repeated keys + values)', config, compressed);

const restored = decompress(compressed) as typeof config;
console.log('\nRestored services.authService:', restored.services.authService);
