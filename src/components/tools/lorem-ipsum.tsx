"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Type } from "lucide-react";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "sapien", "faucibus",
  "nisl", "tincidunt", "eget", "nullam", "felis", "donec", "pretium", "vulputate",
  "lectus", "arcu", "bibendum", "varius", "dui", "vivamus", "massa", "interdum",
  "posuere", "ornare", "pellentesque", "habitant", "morbi", "tristique", "senectus",
  "netus", "malesuada", "fames", "turpis", "egestas", "maecenas", "pharetra",
  "convallis", "cras", "semper", "auctor", "neque", "vitae", "justo", "lacinia",
];

const FIRST_SENTENCE = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSentence(): string {
  const length = randomInt(6, 14);
  const words: string[] = [];
  for (let i = 0; i < length; i++) {
    words.push(LOREM_WORDS[randomInt(0, LOREM_WORDS.length - 1)]);
  }
  words[0] = capitalize(words[0]);
  // Add a comma sometimes
  if (length > 8 && Math.random() > 0.5) {
    const commaPos = randomInt(3, length - 3);
    words[commaPos] = words[commaPos] + ",";
  }
  return words.join(" ") + ".";
}

function generateParagraph(sentenceCount: number): string {
  const sentences: string[] = [];
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence());
  }
  return sentences.join(" ");
}

function generateWords(count: number): string {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(LOREM_WORDS[randomInt(0, LOREM_WORDS.length - 1)]);
  }
  return words.join(" ");
}

type OutputType = "paragraphs" | "sentences" | "words";

export function LoremIpsum() {
  const [outputType, setOutputType] = useState<OutputType>("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const generate = useCallback(() => {
    let result = "";

    switch (outputType) {
      case "paragraphs": {
        const paragraphs: string[] = [];
        for (let i = 0; i < count; i++) {
          const sentenceCount = randomInt(4, 8);
          let p = generateParagraph(sentenceCount);
          if (i === 0 && startWithLorem) {
            p = FIRST_SENTENCE + " " + p;
          }
          paragraphs.push(p);
        }
        result = paragraphs.join("\n\n");
        break;
      }
      case "sentences": {
        const sentences: string[] = [];
        for (let i = 0; i < count; i++) {
          if (i === 0 && startWithLorem) {
            sentences.push(FIRST_SENTENCE);
          } else {
            sentences.push(generateSentence());
          }
        }
        result = sentences.join(" ");
        break;
      }
      case "words": {
        if (startWithLorem) {
          const loremPrefix = "lorem ipsum dolor sit amet";
          const remaining = Math.max(0, count - 5);
          result = remaining > 0 ? loremPrefix + " " + generateWords(remaining) : loremPrefix.split(" ").slice(0, count).join(" ");
        } else {
          result = generateWords(count);
        }
        break;
      }
    }

    setOutput(result);
    setWordCount(result.split(/\s+/).filter(Boolean).length);
  }, [outputType, count, startWithLorem]);

  const copyOutput = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={generate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Type className="h-3.5 w-3.5" />
          Generate
        </button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            min={1}
            max={100}
            className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-center"
          />
          <select
            value={outputType}
            onChange={(e) => setOutputType(e.target.value as OutputType)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={startWithLorem}
            onChange={(e) => setStartWithLorem(e.target.checked)}
            className="rounded"
          />
          Start with &quot;Lorem ipsum...&quot;
        </label>
      </div>

      {/* Output */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-muted-foreground">
            Output {wordCount > 0 && <span className="text-xs">({wordCount} words)</span>}
          </label>
          {output && (
            <button
              onClick={copyOutput}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
        <textarea
          value={output}
          readOnly
          placeholder='Click "Generate" to create lorem ipsum text...'
          className="w-full h-64 rounded-lg border border-border bg-muted/50 p-4 text-sm resize-none leading-relaxed"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
