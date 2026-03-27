import { compress, decompress } from 'tokenzip';
import { printResult } from './_print.js';

const posts = [
  {
    slug: 'intro-to-typescript',
    title: 'Introduction to TypeScript',
    author: 'Alice Mercer',
    category: 'TypeScript',
    summary: 'TypeScript adds static typing to JavaScript, catching errors at compile time. This guide walks through setting up a project from scratch. You will learn about interfaces, generics, and type inference along the way.',
    views: 15200,
    likes: 870,
  },
  {
    slug: 'advanced-generics',
    title: 'Advanced TypeScript Generics',
    author: 'Alice Mercer',
    category: 'TypeScript',
    summary: 'Generics allow you to write reusable, type-safe code across functions and classes. This guide walks through setting up a project from scratch. You will learn about interfaces, generics, and type inference along the way.',
    views: 9800,
    likes: 640,
  },
  {
    slug: 'node-rest-apis',
    title: 'Building REST APIs with Node.js',
    author: 'Bob Harrington',
    category: 'Node.js',
    summary: 'Node.js enables server-side JavaScript with an event-driven, non-blocking architecture. Learn how to design and implement production-ready REST APIs. You will learn about interfaces, generics, and type inference along the way.',
    views: 23400,
    likes: 1420,
  },
  {
    slug: 'typescript-with-react',
    title: 'TypeScript with React',
    author: 'Alice Mercer',
    category: 'TypeScript',
    summary: 'TypeScript adds static typing to JavaScript, catching errors at compile time. Combining TypeScript with React gives you end-to-end type safety across components. Learn how to design and implement production-ready REST APIs.',
    views: 31000,
    likes: 2010,
  },
  {
    slug: 'node-performance',
    title: 'Node.js Performance Tuning',
    author: 'Bob Harrington',
    category: 'Node.js',
    summary: 'Node.js enables server-side JavaScript with an event-driven, non-blocking architecture. Profiling and optimizing Node.js apps requires deep understanding of the event loop. Learn how to design and implement production-ready REST APIs.',
    views: 18700,
    likes: 950,
  },
  {
    slug: 'dependency-injection-ts',
    title: 'Dependency Injection in TypeScript',
    author: 'Carol Kim',
    category: 'TypeScript',
    summary: 'Dependency injection promotes loose coupling and makes your code easier to test. TypeScript adds static typing to JavaScript, catching errors at compile time. You will learn about interfaces, generics, and type inference along the way.',
    views: 7600,
    likes: 530,
  },
  {
    slug: 'microservices-node',
    title: 'Microservices with Node.js',
    author: 'Bob Harrington',
    category: 'Node.js',
    summary: 'Node.js enables server-side JavaScript with an event-driven, non-blocking architecture. Microservices architecture improves scalability and developer team autonomy. Learn how to design and implement production-ready REST APIs.',
    views: 14500,
    likes: 780,
  },
  {
    slug: 'typescript-decorators',
    title: 'TypeScript Decorators Explained',
    author: 'Carol Kim',
    category: 'TypeScript',
    summary: 'Dependency injection promotes loose coupling and makes your code easier to test. TypeScript adds static typing to JavaScript, catching errors at compile time. Decorators provide a way to add metadata and modify class behaviour at runtime.',
    views: 12300,
    likes: 710,
  },
];

const compressed = compress(posts);
printResult('Example 05 — Blog posts (tabular mode, long text + author/category enums)', posts, compressed);

const restored = decompress(compressed) as typeof posts;
console.log('\nRestored post "node-rest-apis":');
console.log('  title  :', restored[2].title);
console.log('  summary:', restored[2].summary);
