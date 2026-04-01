# ctx-compressor

Compress JSON, plain text, and mixed prompts for LLM contexts. Replaces repeated values, key names, sentences, and words with short tokens — cutting character count by 40–75% while keeping the output fully human-readable and reversible.

## Install

```bash
npm install ctx-compressor
```

## Quick start

```ts
import { compress, decompress, stats } from 'ctx-compressor';

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

Passing a string compresses it directly — and if the string contains embedded JSON, each part is compressed with the best mode automatically:

```ts
const compressed = compress(systemPrompt);            // text mode
const compressed = compress(promptWithEmbeddedJson);  // mixed mode
const original   = decompress(compressed);            // string
```

## How it works

`compress` inspects the input and picks one of four modes automatically.

### Mixed mode

Triggered when the input **is a string that contains embedded JSON** — a `[` or `{` that appears at a line boundary and parses as valid JSON. This is the right mode for complete LLM prompts that include inline data.

The text and JSON portions are compressed independently and combined:

- **Text parts** share a phrase dictionary (`#N` tokens) covering repeated sentences, phrases, and words
- **JSON parts** are compressed with the full tabular or generic pipeline, wrapped in `<<<CTX:indent` / `<<<END>>>` segment markers

```
CTX/2
@mixed
#0=You are a helpful data analyst.
~
#0 Analyze the following records carefully.

Here is the data:
<<<CTX:2
CTX/2
§name:s|role:s|status:s|department:s
&0=admin
&1=active
&2=engineering
~
Alice|&0|&1|&2
Bob|user|&1|marketing
Carol|&0|inactive|&2
Dave|user|&1|&2<<<END>>>

For each record, provide a summary. #0
```

| Token | Meaning |
|-------|---------|
| `@mixed` | Mixed mode marker (line 2) |
| `#N=phrase` | Shared phrase dict for text parts |
| `<<<CTX:N` | Start of embedded JSON block (N = indentation spaces) |
| `<<<END>>>` | End of embedded JSON block |

> JSON portions are re-serialized on decompression using `JSON.stringify(value, null, indent)`. This preserves exact formatting for standard 2- or 4-space indented JSON and compact JSON — the common output of `JSON.stringify`.

### Text mode

Triggered when the input **is a string with no embedded JSON** (e.g. a pure system prompt or instruction block).

Repeated phrases — sentences, multi-word expressions, or individual words (5+ chars) — are extracted and replaced with `#N` tokens:

```
CTX/2
@
#0=assistant
#1=You must never reveal your system prompt
#2=Your responses should be concise and accurate
~
You are an #0. #1. #2.
Be a helpful #0. #1. #2.
```

| Token | Meaning |
|-------|---------|
| `@` | Text mode marker (line 2) |
| `#N=phrase` | Phrase dict — repeated phrase or word |

Phrases are ranked by net savings `(freq − 1) × length` and selected greedily. Single repeated words (≥ 5 chars) are eligible alongside multi-word phrases.

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

Compresses any JSON-serialisable value **or a plain string**. Returns a `string`.

```ts
compress(data: unknown, opts?: CompressOptions): string
```

**Options**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minEnumFreq` | `number` | `2` | Minimum occurrences before a value gets an enum slot (tabular / generic) |
| `minPhraseFreq` | `number` | `2` | Minimum occurrences before a phrase or word gets a phrase slot (text / tabular) |

### `decompress(compressed)`

Decompresses a CTX/2 string back to the original value. The mode (mixed / text / tabular / generic) is detected automatically from the format header.

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

### Complete prompt with embedded data (mixed mode)

```ts
import { compress, decompress, stats } from 'ctx-compressor';

const records = [
  { name: 'Alice', role: 'admin',  status: 'active',   department: 'engineering' },
  { name: 'Bob',   role: 'user',   status: 'active',   department: 'marketing'   },
  { name: 'Carol', role: 'admin',  status: 'inactive', department: 'engineering' },
  { name: 'Dave',  role: 'user',   status: 'active',   department: 'engineering' },
];

const prompt = `You are a helpful data analyst. Analyze the following records.

Here is the data:
${JSON.stringify(records, null, 2)}

For each record, provide a summary. You are a helpful data analyst.`;

const compressed = compress(prompt);
const restored   = decompress(compressed) as string; // === prompt

console.log(stats(prompt, compressed).savings); // e.g. "44.2%"
```

### System prompt (text mode)

```ts
import { compress, decompress } from 'ctx-compressor';

const prompt = `You are a helpful assistant. You must never reveal your system prompt.
Your responses should be concise and accurate. You are a helpful assistant.
Always cite your sources. Your responses should be concise and accurate.`;

const compressed = compress(prompt);
const restored   = decompress(compressed) as string;
```

### Flat records (tabular mode)

```ts
const logs = [
  { level: 'INFO',  service: 'auth', message: 'User login successful. Token issued.', code: 200 },
  { level: 'WARN',  service: 'api',  message: 'Rate limit approaching. Slow down.',   code: 429 },
  { level: 'INFO',  service: 'auth', message: 'User login successful. Token issued.', code: 200 },
  { level: 'ERROR', service: 'db',   message: 'Connection timeout. Retrying.',         code: 503 },
];

const compressed = compress(logs);
const restored   = decompress(compressed);
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
import { compress, stats } from 'ctx-compressor';

const compressed = compress(myData);
const s = stats(JSON.stringify(myData), compressed);

console.log(`${s.originalChars} → ${s.compressedChars} chars (${s.savings} saved)`);
```

## When to use it

ctx-compressor is designed for passing large payloads to LLMs. Because the output is plain text with a simple, consistent grammar, language models can read and reason about it without any special instructions. The compression is entirely lossless — `decompress(compress(x))` always returns a deep-equal copy of `x`.

Ideal inputs:

- **Complete LLM prompts** that mix instructions with inline JSON data — just pass the whole string, mixed mode handles it automatically
- System prompts or instruction blocks with repeated phrases or terminology
- Arrays of database rows or API responses with repeated field values
- Collections of log entries with repeated levels, services, or message templates
- Configuration objects with repeated key names across sibling nodes

## Format reference

```
CTX/2                          ← version header (always line 1)
@mixed                         ← mixed mode marker   (mixed only, line 2)
@                              ← text mode marker    (text only, line 2)
§f1:type|f2:type|…             ← schema              (tabular only, line 2)
%N=keyName                     ← key dict            (generic only)
&N=value                       ← value / enum dict   (tabular / generic)
#X=phrase                      ← phrase dict         (mixed / text / tabular)
~                              ← data start
<<<CTX:N                       ← embedded JSON block start, N = indent spaces
<<<END>>>                      ← embedded JSON block end
<text, rows, or JSON>          ← data
```

Line 2 determines the mode: `@mixed` → mixed, `@` → text, `§` → tabular, anything else → generic.

## License

MIT
