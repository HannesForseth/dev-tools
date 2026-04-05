"use client";

import { useState, useMemo } from "react";
import { Copy, Check, FileText, BarChart3, Clock, Hash } from "lucide-react";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "by", "from", "is", "it", "as", "was", "are", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "shall", "can", "this", "that", "these", "those", "i", "me",
  "my", "we", "our", "you", "your", "he", "him", "his", "she", "her", "they",
  "them", "their", "its", "not", "no", "nor", "so", "if", "then", "than",
  "too", "very", "just", "about", "up", "out", "all", "also", "into", "over",
  "after", "before", "between", "under", "again", "there", "here", "when",
  "where", "why", "how", "what", "which", "who", "whom", "each", "every",
  "both", "few", "more", "most", "other", "some", "such", "only", "own",
  "same", "any", "am", "were", "while", "during", "through", "above", "below",
  "because", "until", "against", "further", "once", "de", "en", "et", "le",
  "la", "les", "un", "une", "des", "du", "den", "det", "och", "att", "som",
  "av", "är", "var", "har", "med", "för", "på", "om", "inte", "jag",
]);

function analyzeText(text: string) {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  // Words: split on whitespace, filter empty
  const wordsArray = text.split(/\s+/).filter((w) => w.length > 0);
  const words = wordsArray.length;

  // Sentences: split on sentence-ending punctuation
  const sentences = text.trim()
    ? (text.match(/[.!?]+(?:\s|$)/g) || []).length || (words > 0 ? 1 : 0)
    : 0;

  // Paragraphs: non-empty lines separated by blank lines
  const paragraphs = text.trim()
    ? text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length ||
      (words > 0 ? 1 : 0)
    : 0;

  // Lines
  const lines = text ? text.split("\n").length : 0;

  // Reading time (avg 238 wpm) and speaking time (avg 150 wpm)
  const readingTimeMinutes = words / 238;
  const speakingTimeMinutes = words / 150;

  // Average word length
  const avgWordLength =
    words > 0
      ? wordsArray.reduce((sum, w) => sum + w.replace(/[^a-zA-ZÀ-ÿ]/g, "").length, 0) / words
      : 0;

  // Average sentence length (words per sentence)
  const avgSentenceLength = sentences > 0 ? words / sentences : 0;

  // Word frequency (excluding stop words)
  const freqMap = new Map<string, number>();
  const allWordsMap = new Map<string, number>();

  for (const raw of wordsArray) {
    const cleaned = raw.toLowerCase().replace(/[^a-zA-ZÀ-ÿ'-]/g, "");
    if (!cleaned || cleaned.length < 2) continue;

    allWordsMap.set(cleaned, (allWordsMap.get(cleaned) || 0) + 1);

    if (!STOP_WORDS.has(cleaned)) {
      freqMap.set(cleaned, (freqMap.get(cleaned) || 0) + 1);
    }
  }

  const topWords = Array.from(freqMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Keyword density: top words as percentage of total words
  const keywordDensity = topWords.map(([word, count]) => ({
    word,
    count,
    density: words > 0 ? (count / words) * 100 : 0,
  }));

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    readingTimeMinutes,
    speakingTimeMinutes,
    avgWordLength,
    avgSentenceLength,
    topWords,
    keywordDensity,
  };
}

function formatTime(minutes: number): string {
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    return seconds === 0 ? "0 sec" : `${seconds} sec`;
  }
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs} sec`;
}

export function WordCounter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => analyzeText(text), [text]);

  const copyText = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearText = () => setText("");

  return (
    <div className="space-y-6">
      {/* Primary stats bar */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {[
          { label: "Words", value: stats.words },
          { label: "Characters", value: stats.characters },
          { label: "No Spaces", value: stats.charactersNoSpaces },
          { label: "Sentences", value: stats.sentences },
          { label: "Paragraphs", value: stats.paragraphs },
          { label: "Lines", value: stats.lines },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-3 text-center"
          >
            <div className="text-2xl font-bold text-card-foreground tabular-nums">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Textarea + controls */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Paste or type your text</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearText}
              disabled={!text}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-card-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Clear
            </button>
            <button
              onClick={copyText}
              disabled={!text}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your text here to see real-time word count, character count, reading time, keyword density, and more..."
          className="w-full min-h-[280px] resize-y bg-transparent px-4 py-3 text-sm text-card-foreground placeholder:text-muted-foreground/50 focus:outline-none font-mono leading-relaxed"
          spellCheck={false}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Reading & Speaking Time */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">
              Time Estimates
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Reading time
              </span>
              <span className="text-sm font-medium text-card-foreground tabular-nums">
                {formatTime(stats.readingTimeMinutes)}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary rounded-full h-1.5 transition-all duration-300"
                style={{
                  width: `${Math.min(100, (stats.readingTimeMinutes / 10) * 100)}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Speaking time
              </span>
              <span className="text-sm font-medium text-card-foreground tabular-nums">
                {formatTime(stats.speakingTimeMinutes)}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-blue-500 rounded-full h-1.5 transition-all duration-300"
                style={{
                  width: `${Math.min(100, (stats.speakingTimeMinutes / 15) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground/70 pt-1">
              Based on 238 wpm reading and 150 wpm speaking speed
            </p>
          </div>
        </div>

        {/* Averages */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">
              Averages
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Avg. word length
              </span>
              <span className="text-sm font-medium text-card-foreground tabular-nums">
                {stats.avgWordLength.toFixed(1)} chars
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Avg. sentence length
              </span>
              <span className="text-sm font-medium text-card-foreground tabular-nums">
                {stats.avgSentenceLength.toFixed(1)} words
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Words per paragraph
              </span>
              <span className="text-sm font-medium text-card-foreground tabular-nums">
                {stats.paragraphs > 0
                  ? (stats.words / stats.paragraphs).toFixed(1)
                  : "0.0"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Sentences per paragraph
              </span>
              <span className="text-sm font-medium text-card-foreground tabular-nums">
                {stats.paragraphs > 0
                  ? (stats.sentences / stats.paragraphs).toFixed(1)
                  : "0.0"}
              </span>
            </div>
          </div>
        </div>

        {/* Top Keywords */}
        <div className="rounded-xl border border-border bg-card p-4 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">
              Top Keywords
            </h3>
          </div>
          {stats.keywordDensity.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 py-4 text-center">
              Start typing to see keyword analysis
            </p>
          ) : (
            <div className="space-y-2">
              {stats.keywordDensity.map(({ word, count, density }, i) => (
                <div key={word} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground/60 w-4 text-right tabular-nums">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm text-card-foreground truncate font-medium">
                        {word}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap tabular-nums">
                        {count}x &middot; {density.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div
                        className="bg-primary/70 rounded-full h-1 transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (density / (stats.keywordDensity[0]?.density || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
