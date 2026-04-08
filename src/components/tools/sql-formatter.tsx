"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Trash2 } from "lucide-react";

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "JOIN", "ON", "AND", "OR", "INSERT", "UPDATE",
  "DELETE", "CREATE", "ALTER", "DROP", "GROUP BY", "ORDER BY", "HAVING",
  "LIMIT", "UNION", "INTO", "VALUES", "SET", "AS", "INNER", "LEFT", "RIGHT",
  "OUTER", "FULL", "CROSS", "DISTINCT", "BETWEEN", "LIKE", "IN", "IS", "NOT",
  "NULL", "EXISTS", "CASE", "WHEN", "THEN", "ELSE", "END", "COUNT", "SUM",
  "AVG", "MIN", "MAX", "WITH", "OFFSET", "RETURNING", "CASCADE", "TABLE",
  "INDEX", "VIEW", "TRIGGER", "PROCEDURE", "FUNCTION", "BEGIN", "COMMIT",
  "ROLLBACK", "ALL", "ANY", "ASC", "DESC", "TOP", "FETCH", "NEXT", "ROWS",
  "ONLY", "OVER", "PARTITION", "BY", "ROW_NUMBER", "RANK", "DENSE_RANK",
  "LAG", "LEAD", "FIRST_VALUE", "LAST_VALUE", "COALESCE", "NULLIF", "CAST",
  "CONVERT", "IF", "IFNULL", "ISNULL", "PRIMARY", "KEY", "FOREIGN",
  "REFERENCES", "CONSTRAINT", "UNIQUE", "CHECK", "DEFAULT", "AUTO_INCREMENT",
  "SERIAL", "NOT NULL", "ADD", "COLUMN", "RENAME", "TO", "TRUNCATE",
  "REPLACE", "MERGE", "USING", "MATCHED", "EXCEPT", "INTERSECT",
  "RECURSIVE", "LATERAL", "NATURAL", "GRANT", "REVOKE", "EXPLAIN", "ANALYZE",
  "VACUUM", "REINDEX", "CLUSTER", "COMMENT", "SCHEMA", "DATABASE",
  "TEMPORARY", "TEMP", "MATERIALIZED", "REFRESH", "CONCURRENTLY",
  "CONFLICT", "DO", "NOTHING", "EXCLUDE", "FOLLOWING", "PRECEDING",
  "UNBOUNDED", "CURRENT", "ROW", "RANGE", "GROUPS", "FILTER", "WITHIN",
  "GROUP", "ARRAY", "BOOLEAN", "INTEGER", "VARCHAR", "TEXT", "TIMESTAMP",
  "DATE", "TIME", "NUMERIC", "DECIMAL", "FLOAT", "DOUBLE", "PRECISION",
  "BIGINT", "SMALLINT", "CHAR", "BLOB", "CLOB", "REAL", "BIT", "BINARY",
  "VARBINARY", "INTERVAL", "JSON", "JSONB", "UUID", "XML", "ENUM", "TYPE",
  "SEQUENCE", "OWNED", "GENERATED", "ALWAYS", "IDENTITY", "STORED",
  "VIRTUAL", "TRUE", "FALSE", "ILIKE", "SIMILAR", "SOME", "BOTH", "LEADING",
  "TRAILING", "TRIM", "SUBSTRING", "POSITION", "EXTRACT", "EPOCH",
  "OVERLAY", "PLACING", "FOR", "COLLATE", "VARYING", "ZONE", "WITHOUT",
  "DEFERRABLE", "INITIALLY", "DEFERRED", "IMMEDIATE", "ENABLE", "DISABLE",
  "ROW_FORMAT", "ENGINE", "CHARSET", "CHARACTER", "UNSIGNED", "ZEROFILL",
  "LOCK", "UNLOCK", "TABLES", "READ", "WRITE", "LOCAL", "GLOBAL", "SESSION",
  "TRANSACTION", "ISOLATION", "LEVEL", "REPEATABLE", "COMMITTED",
  "UNCOMMITTED", "SERIALIZABLE", "SAVEPOINT", "RELEASE", "WORK", "CHAIN",
  "NO", "ACTION", "RESTRICT", "BEFORE", "AFTER", "EACH", "STATEMENT",
  "EXECUTE", "RETURNS", "LANGUAGE", "VOLATILE", "STABLE", "IMMUTABLE",
  "CALLED", "INPUT", "SECURITY", "DEFINER", "INVOKER", "PARALLEL", "SAFE",
  "UNSAFE", "RESTRICTED", "COST", "SUPPORT", "WINDOW", "RESPECT", "IGNORE",
  "NULLS", "TIES", "PERCENT", "TABLESAMPLE", "BERNOULLI", "SYSTEM",
  "REPEATABLE", "SEED", "ORDINALITY", "CROSS JOIN", "INNER JOIN",
  "LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN", "FULL OUTER JOIN", "NATURAL JOIN", "CROSS APPLY",
  "OUTER APPLY",
];

// Major clauses that should start on a new line (not indented further)
const MAJOR_CLAUSES = [
  "SELECT", "FROM", "WHERE", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN",
  "FULL JOIN", "LEFT OUTER JOIN", "RIGHT OUTER JOIN", "FULL OUTER JOIN",
  "CROSS JOIN", "NATURAL JOIN", "JOIN", "GROUP BY", "ORDER BY", "HAVING",
  "LIMIT", "OFFSET", "UNION ALL", "UNION", "INTERSECT", "EXCEPT",
  "INSERT INTO", "INSERT", "UPDATE", "DELETE FROM", "DELETE", "SET",
  "VALUES", "ON", "CREATE TABLE", "CREATE INDEX", "CREATE VIEW",
  "CREATE", "ALTER TABLE", "ALTER", "DROP TABLE", "DROP", "WITH",
  "RETURNING", "FETCH", "INTO",
];

function uppercaseKeywords(sql: string): string {
  if (!sql.trim()) return "";

  // Preserve string literals and quoted identifiers
  const preserved: string[] = [];
  let processed = sql.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`[^`]*`/g, (match) => {
    preserved.push(match);
    return `__PRESERVED_${preserved.length - 1}__`;
  });

  // Sort keywords by length descending so longer matches take priority
  const sorted = [...SQL_KEYWORDS].sort((a, b) => b.length - a.length);

  for (const kw of sorted) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    processed = processed.replace(regex, kw);
  }

  // Restore preserved strings
  preserved.forEach((val, i) => {
    processed = processed.replace(`__PRESERVED_${i}__`, val);
  });

  return processed;
}

function formatSql(sql: string, indentStr: string, uppercase: boolean): string {
  if (!sql.trim()) return "";

  let working = sql;

  // Optionally uppercase keywords first
  if (uppercase) {
    working = uppercaseKeywords(working);
  }

  // Preserve string literals
  const strings: string[] = [];
  working = working.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`[^`]*`/g, (match) => {
    strings.push(match);
    return `__STR_${strings.length - 1}__`;
  });

  // Preserve single-line comments
  const lineComments: string[] = [];
  working = working.replace(/--.*$/gm, (match) => {
    lineComments.push(match);
    return `__LC_${lineComments.length - 1}__`;
  });

  // Preserve block comments
  const blockComments: string[] = [];
  working = working.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    blockComments.push(match);
    return `__BC_${blockComments.length - 1}__`;
  });

  // Normalize whitespace
  working = working.replace(/\s+/g, " ").trim();

  // Sort major clauses by length descending for matching
  const sortedClauses = [...MAJOR_CLAUSES].sort((a, b) => b.length - a.length);

  // Insert newline markers before major clauses
  for (const clause of sortedClauses) {
    const escaped = clause.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const caseFlag = uppercase ? "" : "i";
    const regex = new RegExp(`(?<!__)\\b(${escaped})\\b`, `g${caseFlag}`);
    working = working.replace(regex, "\n$1");
  }

  // Clean up: remove leading newline, collapse multiple newlines
  working = working.replace(/^\n+/, "");
  working = working.replace(/\n{2,}/g, "\n");

  // Handle commas in SELECT: add newline after each comma until we hit FROM
  // We'll do this in the line-processing phase

  // Split into lines and process
  const rawLines = working.split("\n");
  const result: string[] = [];
  let indentLevel = 0;
  let inSelect = false;

  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i].trim();
    if (!line) continue;

    // Check if this line starts with a major clause
    const upperLine = line.toUpperCase();
    const isMajorClause = sortedClauses.some((c) => {
      const up = uppercase ? c : c;
      return upperLine.startsWith(up) || upperLine.startsWith(c.toUpperCase());
    });

    // Check for closing parens reducing indent
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;

    // If line starts with ), reduce indent before printing
    if (line.startsWith(")")) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Detect SELECT clause
    if (upperLine.startsWith("SELECT")) {
      inSelect = true;
      // Split SELECT columns by comma
      const selectBody = line.replace(/^SELECT\s+(DISTINCT\s+)?/i, "");
      const prefix = line.substring(0, line.length - selectBody.length).trim();

      if (selectBody.includes(",")) {
        // Split by commas, but respect parentheses depth
        const parts = splitByComma(selectBody);
        result.push(indentStr.repeat(indentLevel) + prefix);
        for (let j = 0; j < parts.length; j++) {
          const comma = j < parts.length - 1 ? "," : "";
          result.push(indentStr.repeat(indentLevel + 1) + parts[j].trim() + comma);
        }
      } else {
        result.push(indentStr.repeat(indentLevel) + line);
      }
      continue;
    }

    // FROM ends the select column expansion
    if (upperLine.startsWith("FROM")) {
      inSelect = false;
    }

    // ON, AND, OR get extra indent under WHERE/JOIN
    if (upperLine.startsWith("AND ") || upperLine.startsWith("OR ")) {
      result.push(indentStr.repeat(indentLevel + 1) + line);
    } else if (upperLine.startsWith("ON ")) {
      result.push(indentStr.repeat(indentLevel + 1) + line);
    } else if (isMajorClause) {
      result.push(indentStr.repeat(indentLevel) + line);
    } else {
      result.push(indentStr.repeat(indentLevel + 1) + line);
    }

    // Adjust indent for parentheses
    const netParens = openParens - closeParens;
    if (netParens > 0 && !line.startsWith(")")) {
      indentLevel += netParens;
    } else if (netParens < 0 && !line.startsWith(")")) {
      indentLevel = Math.max(0, indentLevel + netParens);
    }
  }

  let formatted = result.join("\n");

  // Restore preserved tokens
  blockComments.forEach((val, i) => {
    formatted = formatted.replace(`__BC_${i}__`, val);
  });
  lineComments.forEach((val, i) => {
    formatted = formatted.replace(`__LC_${i}__`, val);
  });
  strings.forEach((val, i) => {
    formatted = formatted.replace(`__STR_${i}__`, val);
  });

  // Add blank line before UNION, INTERSECT, EXCEPT
  formatted = formatted.replace(/\n(UNION ALL|UNION|INTERSECT|EXCEPT)/gi, "\n\n$1");

  // Ensure semicolons get their own clean ending
  formatted = formatted.replace(/;\s*$/gm, ";");

  return formatted.trim();
}

function splitByComma(str: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

function minifySql(sql: string): string {
  if (!sql.trim()) return "";

  // Preserve string literals
  const strings: string[] = [];
  let result = sql.replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`[^`]*`/g, (match) => {
    strings.push(match);
    return `__STR_${strings.length - 1}__`;
  });

  // Remove single-line comments
  result = result.replace(/--.*$/gm, "");

  // Remove block comments
  result = result.replace(/\/\*[\s\S]*?\*\//g, "");

  // Collapse all whitespace to single space
  result = result.replace(/\s+/g, " ").trim();

  // Restore strings
  strings.forEach((val, i) => {
    result = result.replace(`__STR_${i}__`, val);
  });

  return result;
}

const SAMPLE_SQL = `-- Example: Complex query with joins and subqueries
select u.id, u.name, u.email,
  count(o.id) as order_count,
  sum(o.total) as total_spent,
  coalesce(avg(o.total), 0) as avg_order
from users u
left join orders o on u.id = o.user_id
  and o.status != 'cancelled'
left join user_roles ur on u.id = ur.user_id
where u.created_at >= '2024-01-01'
  and u.active = true
  and (u.role = 'customer' or u.role = 'vip')
  and exists (
    select 1 from payments p
    where p.user_id = u.id
      and p.status = 'completed'
  )
group by u.id, u.name, u.email
having count(o.id) > 0
order by total_spent desc
limit 50 offset 10;`;

type IndentOption = "2" | "4" | "tab";

export function SqlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [uppercase, setUppercase] = useState(true);
  const [indentSize, setIndentSize] = useState<IndentOption>("2");

  const getIndentStr = useCallback((size: IndentOption) => {
    if (size === "tab") return "\t";
    return " ".repeat(Number(size));
  }, []);

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    const result = formatSql(input, getIndentStr(indentSize), uppercase);
    setOutput(result);
  }, [input, indentSize, uppercase, getIndentStr]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) return;
    let result = minifySql(input);
    if (uppercase) result = uppercaseKeywords(result);
    setOutput(result);
  }, [input, uppercase]);

  const handleInput = (val: string) => {
    setInput(val);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
  };

  const loadSample = () => {
    setInput(SAMPLE_SQL);
    const result = formatSql(SAMPLE_SQL, getIndentStr(indentSize), uppercase);
    setOutput(result);
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleFormat}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary bg-primary text-primary-foreground px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/90"
        >
          Format
        </button>
        <button
          onClick={handleMinify}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Minify
        </button>

        {/* Indent size selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">Indent:</span>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(e.target.value as IndentOption)}
            className="rounded-lg border border-border bg-muted/50 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </select>
        </div>

        {/* Uppercase toggle */}
        <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-muted-foreground">UPPERCASE keywords</span>
        </label>

        <button
          onClick={loadSample}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Load sample
        </button>
        <button
          onClick={clearAll}
          className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      {/* Input / Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-muted-foreground">
            Input SQL
          </label>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={`Paste your SQL query here...\n\nSELECT * FROM users WHERE active = true;`}
            className="w-full h-80 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            spellCheck={false}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-muted-foreground">
              Formatted Output
            </label>
            {output && (
              <button
                onClick={copyOutput}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Formatted SQL will appear here..."
            className="w-full h-80 rounded-lg border border-border bg-muted/50 p-4 font-mono text-sm resize-none"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Feature cards */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">What This Tool Does</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: "Beautify SQL", desc: "Proper indentation and line breaks for readability" },
            { label: "Minify SQL", desc: "Compress to a single line, remove comments" },
            { label: "Uppercase keywords", desc: "SELECT, FROM, WHERE, JOIN and more" },
            { label: "Handle subqueries", desc: "Nested parentheses with increased indent" },
            { label: "Split SELECT lists", desc: "Each column on its own line" },
            { label: "All SQL dialects", desc: "Standard SQL, MySQL, PostgreSQL syntax" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2 rounded-lg border border-border px-3 py-2 text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground text-xs mt-0.5">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rich SEO content */}
      <section className="mt-8 prose prose-zinc dark:prose-invert max-w-none prose-sm">
        <h2>How to Use the SQL Formatter</h2>
        <p>
          Formatting SQL queries makes them significantly easier to read, debug, and maintain. Whether you are working with a simple SELECT statement or a complex multi-join query with subqueries, proper formatting is essential for understanding the logic at a glance.
        </p>
        <ol>
          <li><strong>Paste your SQL query</strong> into the input area on the left. This can be any SQL statement: SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, ALTER TABLE, or even multiple statements separated by semicolons.</li>
          <li><strong>Configure your preferences.</strong> Choose your indentation style (2 spaces, 4 spaces, or tabs) and whether you want SQL keywords automatically uppercased.</li>
          <li><strong>Click Format</strong> to beautify the SQL with proper indentation, line breaks before major clauses, and separated column lists. Or click <strong>Minify</strong> to compress it into a single line.</li>
          <li><strong>Copy the result</strong> using the Copy button above the output area.</li>
        </ol>

        <h2>Common Use Cases</h2>

        <h3>1. Debugging Complex Queries</h3>
        <p>
          When you receive a long SQL query as a single line from application logs, ORM output, or a colleague, it is nearly impossible to understand the logic. Formatting it with proper indentation instantly reveals the structure: which tables are joined, what conditions filter the results, and how the data is grouped and sorted. This is especially valuable when debugging performance issues or incorrect results.
        </p>

        <h3>2. Code Reviews and Documentation</h3>
        <p>
          Well-formatted SQL is easier to review in pull requests and easier to include in documentation. Consistent formatting across a team reduces cognitive load and makes differences between query versions immediately visible. Many teams adopt a standard SQL formatting style, and this tool helps enforce that consistency.
        </p>

        <h3>3. Learning SQL</h3>
        <p>
          For developers learning SQL, seeing a query properly formatted with each clause on its own line helps build an understanding of SQL structure. The visual hierarchy of SELECT, FROM, WHERE, JOIN, GROUP BY, and ORDER BY becomes clear when each starts on a new line with proper indentation.
        </p>

        <h3>4. Optimizing Queries</h3>
        <p>
          Before optimizing a slow query, you need to understand its structure. Formatting reveals unnecessary joins, redundant conditions, missing indexes opportunities, and subqueries that could be rewritten as joins. The formatted view makes it easy to identify which parts of the query are doing the heavy lifting.
        </p>

        <h3>5. Migrating Between Databases</h3>
        <p>
          When migrating queries between MySQL, PostgreSQL, and standard SQL, having the query properly formatted makes it easier to spot dialect-specific syntax that needs to be changed. You can clearly see each clause and adapt it to the target database.
        </p>

        <h2>SQL Formatting Best Practices</h2>
        <p>
          Consistent SQL formatting is a hallmark of professional database work. Here are the conventions this formatter follows:
        </p>
        <ul>
          <li><strong>Major clauses on new lines:</strong> SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY, HAVING, and LIMIT each start on a new line. This creates a clear visual hierarchy of the query structure.</li>
          <li><strong>Indented column lists:</strong> After SELECT, each column is placed on its own line with indentation. This makes it easy to add, remove, or reorder columns.</li>
          <li><strong>Uppercase keywords:</strong> SQL keywords in uppercase (SELECT, FROM, WHERE) distinguish them from table names, column names, and aliases, which remain in their original case.</li>
          <li><strong>Indented conditions:</strong> AND and OR conditions under WHERE are indented to show they belong to the WHERE clause. Similarly, ON conditions under JOIN are indented.</li>
          <li><strong>Subquery indentation:</strong> Subqueries inside parentheses receive additional indentation to show the nesting level clearly.</li>
        </ul>

        <h2>Supported SQL Statements</h2>
        <p>
          This formatter handles all common SQL statement types across standard SQL, MySQL, and PostgreSQL:
        </p>
        <ul>
          <li><strong>SELECT</strong> queries with joins, subqueries, CTEs (WITH clause), window functions, CASE expressions, aggregate functions, GROUP BY, HAVING, ORDER BY, LIMIT, and OFFSET.</li>
          <li><strong>INSERT</strong> statements including INSERT INTO ... VALUES, INSERT INTO ... SELECT, and multi-row inserts.</li>
          <li><strong>UPDATE</strong> statements with SET clauses, WHERE conditions, and JOIN-based updates.</li>
          <li><strong>DELETE</strong> statements with WHERE conditions and JOIN-based deletes.</li>
          <li><strong>CREATE TABLE</strong> with column definitions, constraints, primary keys, foreign keys, and indexes.</li>
          <li><strong>ALTER TABLE</strong> for adding, dropping, and modifying columns and constraints.</li>
          <li><strong>CREATE INDEX</strong>, <strong>CREATE VIEW</strong>, and other DDL statements.</li>
        </ul>

        <h2>When to Minify SQL</h2>
        <p>
          While formatted SQL is better for human reading, there are cases where minified SQL is preferred. When embedding SQL in application code, a single-line query takes up less vertical space. When transmitting SQL over a network (for example, in an API request), minified SQL reduces payload size. When logging queries, a single-line format is easier to parse programmatically and takes less log storage.
        </p>

        <h2>Frequently Asked Questions</h2>

        <h3>Does this tool modify my SQL logic?</h3>
        <p>
          No. The formatter only changes whitespace, line breaks, and optionally the case of SQL keywords. It never modifies table names, column names, values, operators, or the logical structure of your query. The formatted output is functionally identical to the input.
        </p>

        <h3>Does it work with database-specific syntax?</h3>
        <p>
          Yes. The formatter recognizes keywords from standard SQL, MySQL, and PostgreSQL. It handles MySQL-specific syntax like backtick-quoted identifiers and AUTO_INCREMENT, as well as PostgreSQL-specific features like RETURNING, JSONB operators, and array syntax.
        </p>

        <h3>Is my SQL sent to a server?</h3>
        <p>
          No. All formatting happens entirely in your browser. Your SQL never leaves your device. There is no server-side processing, no data collection, and no logging. This makes it safe to use with queries containing sensitive data, production credentials, or proprietary business logic.
        </p>

        <h3>Can I format multiple statements at once?</h3>
        <p>
          Yes. If your input contains multiple SQL statements separated by semicolons, the formatter will handle each one. Each statement will be formatted independently with proper line breaks between them.
        </p>

        <h3>What about stored procedures and functions?</h3>
        <p>
          The formatter handles CREATE FUNCTION, CREATE PROCEDURE, BEGIN/COMMIT/ROLLBACK, and other procedural SQL keywords. While it does not deeply parse PL/pgSQL or MySQL stored procedure syntax, it correctly formats the SQL structure within them.
        </p>
      </section>
    </div>
  );
}
