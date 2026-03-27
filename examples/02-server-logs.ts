import { compress, decompress } from 'ctx-compressor';
import { printResult } from './_print.js';

const logs = [
  { timestamp: '2024-06-01T09:00:01Z', level: 'INFO',  service: 'auth-service',    message: 'User login successful. Session token issued. Request processed in 42ms.',            requestId: 'req_a1b2' },
  { timestamp: '2024-06-01T09:00:03Z', level: 'INFO',  service: 'api-gateway',     message: 'Incoming request validated. Rate limit check passed. Forwarding to upstream.',       requestId: 'req_c3d4' },
  { timestamp: '2024-06-01T09:00:07Z', level: 'WARN',  service: 'api-gateway',     message: 'Rate limit threshold approaching. Request queue length elevated. Consider scaling.', requestId: 'req_e5f6' },
  { timestamp: '2024-06-01T09:00:12Z', level: 'INFO',  service: 'auth-service',    message: 'User login successful. Session token issued. Request processed in 38ms.',            requestId: 'req_g7h8' },
  { timestamp: '2024-06-01T09:00:15Z', level: 'ERROR', service: 'database',        message: 'Connection pool exhausted. Retrying with backoff. All replicas unreachable.',        requestId: 'req_i9j0' },
  { timestamp: '2024-06-01T09:00:18Z', level: 'WARN',  service: 'database',        message: 'Connection pool exhausted. Query queue growing. Consider scaling.',                  requestId: 'req_k1l2' },
  { timestamp: '2024-06-01T09:00:22Z', level: 'INFO',  service: 'api-gateway',     message: 'Incoming request validated. Rate limit check passed. Forwarding to upstream.',       requestId: 'req_m3n4' },
  { timestamp: '2024-06-01T09:00:25Z', level: 'INFO',  service: 'auth-service',    message: 'Session token issued. User login successful. Request processed in 55ms.',            requestId: 'req_o5p6' },
  { timestamp: '2024-06-01T09:00:29Z', level: 'ERROR', service: 'payment-service', message: 'Payment gateway timeout. Retrying with backoff. Transaction rolled back.',           requestId: 'req_q7r8' },
  { timestamp: '2024-06-01T09:00:33Z', level: 'WARN',  service: 'api-gateway',     message: 'Rate limit threshold approaching. Consider scaling. Request queue length elevated.', requestId: 'req_s9t0' },
  { timestamp: '2024-06-01T09:00:36Z', level: 'INFO',  service: 'auth-service',    message: 'User login successful. Session token issued. Request processed in 41ms.',            requestId: 'req_u1v2' },
  { timestamp: '2024-06-01T09:00:40Z', level: 'ERROR', service: 'database',        message: 'Connection pool exhausted. All replicas unreachable. Retrying with backoff.',        requestId: 'req_w3x4' },
];

const compressed = compress(logs);
printResult('Example 02 — Server logs (high repetition in level + service + message)', logs, compressed);

const restored = decompress(compressed) as typeof logs;
console.log('\nRestored entry [4]:', restored[4]);
