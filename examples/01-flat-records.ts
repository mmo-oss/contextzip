import { compress, decompress } from 'contextzip';
import { printResult } from './_print.js';

const users = [
  { id: 'u_001', name: 'Alice Mercer',   role: 'admin',  department: 'Engineering', status: 'active',   joined: '2021-03-15' },
  { id: 'u_002', name: 'Bob Harrington', role: 'member', department: 'Engineering', status: 'active',   joined: '2022-07-01' },
  { id: 'u_003', name: 'Carol Kim',      role: 'member', department: 'Design',      status: 'active',   joined: '2022-11-20' },
  { id: 'u_004', name: 'David Osei',     role: 'admin',  department: 'Engineering', status: 'inactive', joined: '2020-06-10' },
  { id: 'u_005', name: 'Eva Rossi',      role: 'member', department: 'Design',      status: 'active',   joined: '2023-01-05' },
  { id: 'u_006', name: 'Frank Müller',   role: 'member', department: 'Marketing',   status: 'active',   joined: '2023-04-18' },
  { id: 'u_007', name: 'Grace Obi',      role: 'admin',  department: 'Marketing',   status: 'active',   joined: '2021-09-30' },
  { id: 'u_008', name: 'Hiro Tanaka',    role: 'member', department: 'Engineering', status: 'inactive', joined: '2022-02-14' },
  { id: 'u_009', name: 'Isla Fernández', role: 'member', department: 'Design',      status: 'active',   joined: '2023-08-22' },
  { id: 'u_010', name: 'James Watt',     role: 'member', department: 'Marketing',   status: 'active',   joined: '2024-01-11' },
];

const compressed = compress(users);
printResult('Example 01 — Flat records (user list)', users, compressed);

const restored = decompress(compressed) as typeof users;
console.log('\nRestored first record:', restored[0]);
