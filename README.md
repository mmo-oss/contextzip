# tokenzip

Compress JSON for LLM contexts. Replaces repeated values, key names, and sentences with short tokens - cutting character count by 50–75% while keeping the output fully human-readable and reversible.

## Install

```bash
npm install tokenzip
```

## Quick start

```ts
import { compress, decompress, stats } from 'tokenzip';

const data = [
  { name: 'Adeel Solangi', language: 'Sindhi', id: 'V59OF92YF627HFY0', version: 6.1 },
  { name: 'Afzal Ghaffar', language: 'Sindhi', id: 'ENTOCR13RSCLZ6KU', version: 1.88 },
  { name: 'Abla Dilmurat', language: 'Uyghur', id: '5ZVOEPMJUI4MB4EN', version: 2.53 },
];

const compressed = compress(data);
const original   = decompress(compressed);
const s          = stats(JSON.stringify(data), compressed);

console.log(s.savings); // e.g. "51.6%"
```

## How it works

`compress` inspects the input and picks one of two modes automatically.

### Tabular mode

Triggered when the input is a **flat array of plain objects** (no nested objects or arrays as values). This is the most efficient mode.

The output has four sections separated by newlines:

```
CTX/2
§name:s|language:s|id:s|bio:t|version:n2
&0=Sindhi
&1=Uyghur
#0=Vestibulum ante ipsum primis in faucibus...
#1=Integer vehicula, arcu sit amet egestas...
~
Adeel Solangi|&0|V59OF92YF627HFY0|#0. #1.|610
Afzal Ghaffar|*|ENTOCR13RSCLZ6KU|#1. #0.|188
Abla Dilmurat|&1|5ZVOEPMJUI4MB4EN|#0.|253
```

| Token | Meaning |
|-------|---------|
| `§field:type\|…` | Schema — field names and types |
| `&N=value` | Enum dict — repeated short string values |
| `#X=sentence` | Phrase dict — repeated sentences in long-text fields |
| `~` | Start of data rows |
| `*` | Same value as the previous row for this column |
| `nX` type | Number stored as integer × 10^X (e.g. `n2` stores `6.10` as `610`) |
| `t` type | Long-text field — sentence-level phrase encoding applied |
| `s` type | Short string field — enum substitution applied |

### Generic mode

Triggered for **everything else** — plain objects, nested structures, arrays containing nested objects.

The output is compact JSON with repeated key names replaced by `%N` tokens and repeated string values replaced by `&N` tokens:

```
CTX/2
%0=customer
%1=price
&0=HDPH-01
&1=shipped
~
[{"%0":{"name":"Alice"},"%1":149.99,"status":"&1"},...]
```

| Token | Meaning |
|-------|---------|
| `%N=keyName` | Key dict — repeated object key names |
| `&N=value` | Value dict — repeated string values |

## API

### `compress(data, options?)`

Compresses any JSON-serialisable value. Returns a `string`.

```ts
compress(data: unknown, opts?: CompressOptions): string
```

**Options**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minEnumFreq` | `number` | `2` | Minimum occurrences before a value gets an enum slot |
| `minPhraseFreq` | `number` | `2` | Minimum occurrences before a sentence gets a phrase slot (tabular mode only) |

### `decompress(compressed)`

Decompresses a CTX/2 string back to the original value. The mode (tabular vs generic) is detected automatically.

```ts
decompress(input: string): unknown
```

### `stats(originalJson, compressed)`

Returns size statistics comparing the original JSON string to the compressed output.

```ts
stats(originalJson: string, compressed: string): CompressionStats
```

```ts
interface CompressionStats {
  originalChars:   number;
  compressedChars: number;
  ratio:           number; // compressed / original
  savings:         string; // e.g. "75.7%"
}
```

## Examples

### Flat records (tabular mode)

```ts
import { compress, decompress } from 'tokenzip';

const logs = [
  { level: 'INFO',  service: 'auth',  message: 'User login successful. Token issued.', code: 200 },
  { level: 'WARN',  service: 'api',   message: 'Rate limit approaching. Slow down.',   code: 429 },
  { level: 'INFO',  service: 'auth',  message: 'User login successful. Token issued.', code: 200 },
  { level: 'ERROR', service: 'db',    message: 'Connection timeout. Retrying.',         code: 503 },
];

const compressed = compress(logs);
// CTX/2
// §level:s|service:s|message:t|code:n0
// &0=INFO
// &1=WARN
// ...

const restored = decompress(compressed);
// back to original array
```

### Nested object (generic mode)

```ts
const config = {
  server: { host: 'localhost', port: 3000, env: 'production' },
  db:     { host: 'localhost', port: 5432, env: 'production' },
  cache:  { host: 'localhost', port: 6379, env: 'production' },
};

const compressed = compress(config);
// CTX/2
// %0=host
// %1=port
// %2=env
// &0=localhost
// &1=production
// ~
// {server:{"%0":"&0","%1":3000,"%2":"&1"},db:{"%0":"&0","%1":5432,...}}
```

### Measuring savings

```ts
import { compress, stats } from 'tokenzip';

const compressed = compress(myData);
const s = stats(JSON.stringify(myData), compressed);

console.log(`${s.originalChars} → ${s.compressedChars} chars (${s.savings} saved)`);
```

## When to use it

tokenzip is designed for passing large JSON payloads to LLMs. Because the output is plain text with a simple, consistent grammar, language models can read and reason about it without any special instructions. The compression is entirely lossless — `decompress(compress(x))` always returns a deep-equal copy of `x`.

Ideal inputs:

- Arrays of database rows or API responses with repeated field values
- Collections of log entries with repeated levels, services, or message templates
- Configuration objects with repeated key names across sibling nodes
- Any JSON where the same strings appear many times

## Format reference

```
CTX/2                          ← version header (always line 1)
§f1:type|f2:type|…             ← schema    (tabular only, line 2)
%N=keyName                     ← key dict  (generic only)
&N=value                       ← value / enum dict (both modes)
#X=sentence                    ← phrase dict (tabular only)
~                              ← data start
<rows or JSON>                 ← data
```

The presence of a `§` line on line 2 is what `decompress` uses to tell the two modes apart.

## License

ISC
