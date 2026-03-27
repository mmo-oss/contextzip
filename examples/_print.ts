import { stats } from 'contextzip';

export function printResult(label: string, original: unknown, compressed: string) {
  const s = stats(JSON.stringify(original), compressed);

  console.log('\n' + '─'.repeat(60));
  console.log(label);
  console.log('─'.repeat(60));
  console.log(`Original  : ${s.originalChars} chars`);
  console.log(`Compressed: ${s.compressedChars} chars  (${s.savings} saved)`);
  console.log('\nCompressed output:\n');
  console.log(compressed);
}
