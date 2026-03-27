import { compress, decompress } from 'tokenzip';
import { printResult } from './_print.js';

const orders = [
  {
    orderId: 'ORD-8821',
    status: 'delivered',
    customer: { name: 'Alice Mercer', email: 'alice@example.com', country: 'US' },
    items: [
      { sku: 'LAPTOP-PRO-15', name: 'Pro Laptop 15"',  qty: 1, unitPrice: 1299.99 },
      { sku: 'MOUSE-WL-01',   name: 'Wireless Mouse',  qty: 2, unitPrice: 29.99   },
    ],
    payment: { method: 'credit_card', currency: 'USD', status: 'settled' },
  },
  {
    orderId: 'ORD-8822',
    status: 'processing',
    customer: { name: 'Bob Harrington', email: 'bob@example.com', country: 'CA' },
    items: [
      { sku: 'MONITOR-4K-27', name: '4K Monitor 27"',  qty: 1, unitPrice: 549.00  },
      { sku: 'CABLE-HDMI-2M', name: 'HDMI Cable 2m',   qty: 2, unitPrice: 12.99   },
    ],
    payment: { method: 'paypal', currency: 'USD', status: 'pending' },
  },
  {
    orderId: 'ORD-8823',
    status: 'delivered',
    customer: { name: 'Carol Kim', email: 'carol@example.com', country: 'US' },
    items: [
      { sku: 'MOUSE-WL-01',   name: 'Wireless Mouse',  qty: 3, unitPrice: 29.99   },
      { sku: 'LAPTOP-PRO-15', name: 'Pro Laptop 15"',  qty: 1, unitPrice: 1299.99 },
      { sku: 'CABLE-HDMI-2M', name: 'HDMI Cable 2m',   qty: 1, unitPrice: 12.99   },
    ],
    payment: { method: 'credit_card', currency: 'USD', status: 'settled' },
  },
  {
    orderId: 'ORD-8824',
    status: 'cancelled',
    customer: { name: 'David Osei', email: 'david@example.com', country: 'GB' },
    items: [
      { sku: 'MONITOR-4K-27', name: '4K Monitor 27"',  qty: 2, unitPrice: 549.00  },
    ],
    payment: { method: 'credit_card', currency: 'GBP', status: 'refunded' },
  },
  {
    orderId: 'ORD-8825',
    status: 'delivered',
    customer: { name: 'Eva Rossi', email: 'eva@example.com', country: 'IT' },
    items: [
      { sku: 'CABLE-HDMI-2M', name: 'HDMI Cable 2m',   qty: 4, unitPrice: 12.99   },
      { sku: 'MOUSE-WL-01',   name: 'Wireless Mouse',  qty: 1, unitPrice: 29.99   },
    ],
    payment: { method: 'paypal', currency: 'EUR', status: 'settled' },
  },
];

const compressed = compress(orders);
printResult('Example 04 — Nested orders array (generic mode, repeated keys + values + skus)', orders, compressed);

const restored = decompress(compressed) as typeof orders;
console.log('\nRestored order ORD-8823 items:', restored[2].items);
