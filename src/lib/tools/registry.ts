export type ToolCategory = "dev" | "media" | "ai";
export type CostTier = "free" | "huggingface" | "claude";

export interface FAQ {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  category: ToolCategory;
  costTier: CostTier;
  keywords: string[];
  icon: string; // Lucide icon name
  isNew?: boolean;
  isPro?: boolean;
  relatedSlugs?: string[];
  faq?: FAQ[];
  /** Multi-paragraph detailed description for SEO content depth */
  detailedDescription?: string[];
  /** Step-by-step how-to guide */
  howToUse?: string[];
  /** Real-world use case scenarios */
  useCases?: { title: string; description: string }[];
  /** Technical details section */
  technicalDetails?: string[];
}

// Central registry — add a tool by adding an entry here + creating the component
export const tools: ToolDefinition[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter & Validator",
    description: "Format, validate, and beautify JSON with AI-powered error explanations.",
    longDescription: "Paste your JSON to instantly format, validate, and beautify it. Get clear error messages with AI-powered explanations when your JSON is invalid. Supports minification, tree view, and copy-to-clipboard.",
    category: "dev",
    costTier: "free",
    keywords: ["json formatter", "json validator", "json beautifier", "json formatter online", "format json"],
    icon: "Braces",
    relatedSlugs: ["csv-json", "jwt-decoder", "base64", "regex-tester"],
    detailedDescription: [
      "If you've ever worked with APIs, configuration files, or any web application, you've dealt with JSON. And if you've dealt with JSON, you've stared at a wall of unformatted text trying to figure out where that missing comma is. AllKit's JSON Formatter takes messy, minified, or broken JSON and turns it into clean, indented, readable code in milliseconds.",
      "What makes this tool different from other JSON formatters is the AI-powered error detection. Instead of a cryptic 'Unexpected token at position 4832', you get a plain-English explanation of what went wrong and where. The AI understands common mistakes — trailing commas, single quotes, unquoted keys, comments in JSON — and tells you exactly how to fix them. It's like having a senior developer looking over your shoulder.",
      "The tool supports everything you'd expect: beautification with configurable indentation (2 or 4 spaces, or tabs), minification for production use, a collapsible tree view for navigating large documents, and one-click copy to clipboard. It handles massive JSON files without breaking a sweat because everything runs locally in your browser — no server roundtrips, no file size limits imposed by an API.",
      "Whether you're debugging an API response, editing a package.json, inspecting a MongoDB document, or validating a JSON config file, this is the fastest way to get it done. No ads, no distractions, no signup — just paste your JSON and go."
    ],
    howToUse: [
      "Paste your JSON into the input editor on the left side. You can paste minified JSON, partially formatted JSON, or even JSON with errors.",
      "The formatter immediately validates your JSON and shows the result. If the JSON is valid, you'll see the beautifully formatted output. If there are errors, you'll see clear error messages with line numbers.",
      "Use the Format button to apply pretty-printing with proper indentation. Choose between 2-space, 4-space, or tab indentation based on your preference.",
      "Use the Minify button to compress your JSON into a single line by removing all unnecessary whitespace. This is useful for reducing payload size in production.",
      "Toggle the Tree View to see your JSON as an interactive, collapsible tree structure. This is especially helpful for navigating deeply nested objects and large arrays.",
      "Click Copy to Clipboard to copy the formatted or minified result. The button confirms the copy with a brief visual feedback.",
      "If your JSON has errors, read the AI-powered error explanation below the editor. It tells you not just where the error is, but what's wrong and how to fix it."
    ],
    useCases: [
      { title: "API Response Debugging", description: "When you get a minified JSON response from an API (via curl, Postman, or browser dev tools), paste it here to see the structure clearly. Quickly find the nested field you're looking for without manually counting brackets." },
      { title: "Configuration File Editing", description: "JSON config files like package.json, tsconfig.json, .eslintrc, and AWS CloudFormation templates can get complex. Format them to review structure, then minify before deploying." },
      { title: "Database Document Inspection", description: "MongoDB, CouchDB, and other document databases store data as JSON. When you export or query documents, paste them here to read and validate the structure." },
      { title: "Data Validation Before Import", description: "Before importing JSON data into a database, spreadsheet, or application, validate it here first. Catch syntax errors, missing fields, and structural issues before they cause downstream failures." },
      { title: "Webhook Payload Inspection", description: "When debugging webhooks from Stripe, GitHub, Slack, or other services, paste the raw payload to understand its structure and find the fields you need to handle." },
      { title: "Learning and Teaching JSON", description: "If you're learning web development or teaching others, this tool helps visualize JSON structure. The tree view makes nested relationships clear, and error messages explain common mistakes." },
      { title: "Converting Between Formats", description: "Use the formatted output as a starting point for converting to other formats. Pair with AllKit's CSV-to-JSON converter or YAML-to-JSON converter for complete data transformation workflows." }
    ],
    technicalDetails: [
      "Parsing and formatting uses the browser's native JSON.parse() and JSON.stringify() methods, which are implemented in C++ inside the JavaScript engine. This means formatting is extremely fast — even multi-megabyte JSON files are processed in milliseconds.",
      "Error detection goes beyond the standard JSON.parse error messages. The tool analyzes common error patterns like trailing commas (valid in JavaScript but not JSON), single-quoted strings, comments (// and /* */), unquoted property names, and hexadecimal number literals.",
      "The tree view renders as a virtual component that only shows visible nodes, so it performs well even with JSON documents containing thousands of nested objects. Expand and collapse nodes to focus on the section you care about.",
      "All processing is 100% client-side using Web APIs. Your JSON data never leaves your browser, making it safe for sensitive data like API keys, user data, or internal configuration."
    ],
    faq: [
      { question: "What is JSON?", answer: "JSON (JavaScript Object Notation) is a lightweight data interchange format. It uses key-value pairs and ordered lists to represent structured data. Almost every programming language can read and write JSON, which makes it the standard format for APIs, configuration files, and data storage." },
      { question: "Why does my JSON fail validation?", answer: "The most common causes are: trailing commas after the last element (allowed in JavaScript but not in JSON), single quotes instead of double quotes, unquoted property names, comments (JSON doesn't support them), and missing commas between elements. The AI error explanation will tell you exactly what's wrong." },
      { question: "Is my data safe when I paste JSON here?", answer: "Yes. All formatting and validation happens entirely in your browser using JavaScript. Your JSON is never sent to any server, never logged, and never stored. You can verify this by disconnecting from the internet — the tool works offline." },
      { question: "Can I minify JSON with this tool?", answer: "Yes. Click the Minify button to remove all whitespace, newlines, and indentation. This produces the most compact representation, ideal for reducing payload size in API responses, config files, and data storage." },
      { question: "What's the maximum JSON file size I can format?", answer: "There's no hard limit since processing happens in your browser. JSON files up to 10-20MB format smoothly. Very large files (50MB+) might cause your browser tab to slow down depending on your device's available memory." },
      { question: "Can I use this to fix broken JSON?", answer: "The tool identifies and explains JSON syntax errors, but doesn't auto-fix them (because the 'fix' depends on your intent). The AI-powered error messages tell you exactly what's wrong and how to fix it, so you can correct issues in seconds." },
      { question: "What's the difference between JSON and JavaScript objects?", answer: "JSON is a strict subset of JavaScript object literal syntax. Key differences: JSON requires double quotes around all property names and string values, doesn't allow trailing commas, doesn't support comments, functions, or undefined values." },
      { question: "Does it support JSON5 or JSONC?", answer: "The validator checks against the strict JSON specification (RFC 8259). JSON5 features like comments, trailing commas, and single quotes will be flagged as errors — but the AI error messages explain what's wrong and suggest the JSON-compliant alternative." },
      { question: "Can I format JSON via API?", answer: "Yes! AllKit provides a REST API at /api/v1/json-format that accepts JSON and returns the formatted result. You get 3 free API requests per day, with unlimited requests on the Pro plan." },
      { question: "How does the tree view work?", answer: "The tree view renders your JSON as a collapsible hierarchy. Objects and arrays can be expanded or collapsed, and each node shows its key, type, and value. It's the fastest way to navigate large, deeply nested JSON documents without getting lost in brackets." }
    ],
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate UUIDs (v4) instantly. Bulk generation, copy-to-clipboard.",
    longDescription: "Generate cryptographically secure UUIDs (Universally Unique Identifiers) version 4. Create single or bulk UUIDs, copy to clipboard, and choose your format. No data leaves your browser.",
    category: "dev",
    costTier: "free",
    keywords: ["uuid generator", "guid generator", "uuid v4", "random uuid", "unique id generator"],
    icon: "Fingerprint",
    relatedSlugs: ["hash-generator", "password-generator", "json-formatter"],
    faq: [
      { question: "What is a UUID?", answer: "A UUID (Universally Unique Identifier) is a 128-bit identifier that is guaranteed to be unique across space and time. The v4 variant uses random numbers, making collisions practically impossible." },
      { question: "What's the difference between UUID and GUID?", answer: "They're the same thing. UUID is the official standard name (RFC 4122), while GUID (Globally Unique Identifier) is Microsoft's term for the same concept." },
      { question: "Are UUIDs truly unique?", answer: "For practical purposes, yes. The probability of generating two identical v4 UUIDs is approximately 1 in 5.3 × 10^36. You'd need to generate 1 billion UUIDs per second for 85 years to have a 50% chance of a collision." },
    ],
  },
  {
    slug: "base64",
    name: "Base64 Encode / Decode",
    description: "Encode and decode Base64 strings instantly in your browser.",
    longDescription: "Convert text to Base64 and back instantly. Supports UTF-8, file encoding, URL-safe Base64, and handles large inputs efficiently. All processing happens client-side — your data never leaves your browser.",
    category: "dev",
    costTier: "free",
    keywords: ["base64 decode", "base64 encode", "base64 decoder", "base64 encoder", "base64 decode online"],
    icon: "Binary",
    relatedSlugs: ["url-encoder", "hash-generator", "jwt-decoder", "json-formatter"],
    detailedDescription: [
      "Base64 is one of those things you run into constantly as a developer but rarely think about until you need to encode or decode something in a hurry. You get a Base64 string in an API response and need to see what's inside. You need to embed a small image directly in CSS. You're debugging a JWT token and want to read the payload. You're working with email headers that encode subject lines in Base64. This tool handles all of that instantly.",
      "AllKit's Base64 encoder and decoder works in both directions: paste plain text to get Base64, or paste Base64 to get the original text back. It fully supports UTF-8, so you can encode text in any language — Chinese, Arabic, emoji, special characters — and it all round-trips correctly. It also supports URL-safe Base64 (using - and _ instead of + and /) which is commonly used in JWT tokens, URL parameters, and file names.",
      "The tool handles large inputs efficiently because everything runs in your browser using native JavaScript APIs. There's no server involved, no file size restrictions from an upload endpoint, and no waiting for network roundtrips. Paste a massive Base64 string from a data URI and see the decoded result instantly.",
      "Security matters when you're encoding and decoding data. Because this tool runs entirely client-side, your data never touches a server. This makes it safe for decoding Base64 strings that contain sensitive information like API keys, tokens, encoded credentials, or personal data. You're not sending your secrets to some random server to decode them."
    ],
    howToUse: [
      "Choose your mode: Encode (text to Base64) or Decode (Base64 to text). The default is Encode.",
      "Paste or type your input in the top text area. For encoding, enter the plain text you want to convert. For decoding, paste the Base64 string.",
      "The result appears instantly in the output area below. There's no need to click a button — the conversion happens in real time as you type.",
      "Use the URL-safe toggle if you need Base64 that's safe for URLs and filenames. This replaces + with - and / with _ in the output, which is required for JWT tokens and URL parameters.",
      "Click the Copy button to copy the result to your clipboard. A brief confirmation appears to let you know it worked.",
      "To swap directions (decode what you just encoded, or vice versa), click the swap button to flip the input and output.",
      "For file encoding, you can paste the content of binary files as text. For image embedding, the output gives you a data URI you can use directly in HTML or CSS."
    ],
    useCases: [
      { title: "Decoding JWT Tokens", description: "JWT tokens consist of Base64-encoded JSON segments. While AllKit has a dedicated JWT Decoder, you can also paste individual token segments here to see the raw JSON header or payload." },
      { title: "Embedding Images in HTML/CSS", description: "Convert small images (icons, logos) to Base64 data URIs to embed them directly in HTML or CSS. This eliminates extra HTTP requests, which can improve page load performance for small assets." },
      { title: "Debugging API Responses", description: "Many APIs return data encoded in Base64 — especially binary data like PDF files, images, or encrypted payloads. Paste the Base64 string here to see what's inside without writing any code." },
      { title: "Email Header Decoding", description: "Email subjects and headers with non-ASCII characters are often encoded in Base64 (indicated by =?UTF-8?B?...?= format). Decode them here to read the actual text content." },
      { title: "Basic Authentication Headers", description: "HTTP Basic Authentication encodes username:password as Base64. If you're debugging auth headers, paste the token here to see the credentials (remember, Base64 is not encryption)." },
      { title: "Data URI Creation", description: "Create data URIs for fonts, SVGs, and small files to embed in web applications. This is useful for single-file HTML pages, email templates, and reducing dependency on external resources." },
      { title: "Certificate and Key Inspection", description: "SSL certificates, PEM files, and cryptographic keys are stored in Base64-encoded format. While you can't fully parse them with this tool, you can verify the encoding is intact and see the raw binary data." }
    ],
    technicalDetails: [
      "Base64 encoding maps every 3 bytes of input to 4 ASCII characters using a 64-character alphabet: A-Z, a-z, 0-9, + and /. The = character is used for padding when the input length isn't a multiple of 3. This means Base64 output is always exactly 4/3 the size of the input (about 33% larger).",
      "URL-safe Base64 (also called Base64url, defined in RFC 4648) replaces + with - and / with _ to avoid conflicts with URL syntax. It optionally omits the = padding. This variant is used in JWTs, many OAuth implementations, and anywhere Base64 data appears in URLs.",
      "The tool uses the browser's native btoa() and atob() functions for ASCII content, with a TextEncoder/TextDecoder wrapper for full UTF-8 support. This means encoding and decoding is handled by optimized browser engine code, not a JavaScript library, so it's extremely fast.",
      "For UTF-8 content, the encoding process first converts the string to a UTF-8 byte sequence, then Base64-encodes those bytes. Decoding reverses the process. This correctly handles multi-byte characters including emoji (which are 4 bytes in UTF-8), CJK characters, accented letters, and any Unicode content."
    ],
    faq: [
      { question: "What is Base64 encoding?", answer: "Base64 is a binary-to-text encoding that converts any data into ASCII characters. It uses a 64-character alphabet (A-Z, a-z, 0-9, +, /) to represent binary data as text. It's used everywhere: email attachments, data URIs in HTML/CSS, JWT tokens, API payloads, and file encoding." },
      { question: "Why is Base64 data about 33% larger than the original?", answer: "Base64 encodes 3 bytes of input into 4 ASCII characters. Each character represents 6 bits instead of 8, so you need more characters to represent the same data. The ratio is exactly 4:3, which means the output is always about 33.3% larger than the input." },
      { question: "Is Base64 encryption? Is it secure?", answer: "No. Base64 is an encoding scheme, not encryption. Anyone can decode Base64 — there's no key, no secret, no security. Never use Base64 to protect sensitive data. It's designed for safe data transport (ensuring binary data survives text-only channels), not for confidentiality." },
      { question: "What's the difference between Base64 and URL-safe Base64?", answer: "Standard Base64 uses + and / characters, which have special meaning in URLs. URL-safe Base64 (Base64url) replaces + with - and / with _, making it safe to use in URLs, filenames, and query parameters. JWT tokens always use URL-safe Base64." },
      { question: "Can I encode files to Base64?", answer: "Yes. You can paste file contents as text for encoding. For creating data URIs for images, the format is: data:[mime-type];base64,[encoded-data]. For example, a PNG image would start with data:image/png;base64, followed by the Base64-encoded file bytes." },
      { question: "Why do I see '==' at the end of Base64 strings?", answer: "The = character is padding. Base64 processes input in 3-byte blocks. If the input isn't evenly divisible by 3, padding is added: one = if there's one spare byte, two == if there are two spare bytes. Some implementations (especially URL-safe Base64) omit the padding since the decoder can infer it." },
      { question: "Is my data safe when encoding/decoding here?", answer: "Yes. Everything happens in your browser using native JavaScript APIs. Your data is never sent to any server, never logged, and never stored. This tool works even when you're offline — disconnect from the internet and try it." },
      { question: "Can Base64 handle non-English text and emoji?", answer: "Yes. This tool fully supports UTF-8 encoding, so you can encode and decode text in any language — Chinese, Japanese, Arabic, Cyrillic, emoji, and any Unicode characters. The text is first converted to UTF-8 bytes, then those bytes are Base64-encoded." },
      { question: "What's the maximum input size?", answer: "There's no hard limit since all processing happens in your browser. In practice, inputs up to several megabytes are handled smoothly. Very large inputs (10MB+) may cause a brief pause while the browser processes the data." },
      { question: "How do I decode a Base64 image?", answer: "If you have a data URI (starting with data:image/...), you'll need to remove the prefix before the Base64 data. Paste just the Base64 portion (after the comma) and decode it. The result will be binary data representing the image file." }
    ],
  },
  {
    slug: "regex-tester",
    name: "Regex Tester & AI Builder",
    description: "Test regex patterns with live matching. Describe what you need in plain English and AI builds the regex.",
    longDescription: "A powerful regular expression tester with real-time matching, group highlighting, and an AI-powered builder. Describe what you want to match in plain English and get a working regex instantly. Includes cheat sheet and common patterns.",
    category: "dev",
    costTier: "claude",
    keywords: ["regex tester", "regex tester online", "regular expression tester", "regex builder", "regex generator"],
    icon: "Regex",
    relatedSlugs: ["json-formatter", "diff-checker", "cron-generator"],
    faq: [
      { question: "What are regular expressions?", answer: "Regular expressions (regex) are patterns used to match character combinations in strings. They're essential for validation, search-and-replace, and data extraction in programming." },
      { question: "How does the AI regex builder work?", answer: "Describe what you want to match in plain English — like 'email addresses' or 'dates in MM/DD/YYYY format' — and AI generates a tested regex pattern with an explanation of each part." },
      { question: "Which regex flavors are supported?", answer: "The tester uses JavaScript's built-in regex engine, which supports most common features including lookahead, lookbehind, named groups, and Unicode properties." },
    ],
  },
  {
    slug: "background-remover",
    name: "Remove Background from Image",
    description: "Remove image backgrounds instantly with AI. Get a transparent PNG in seconds, free.",
    longDescription: "Upload any photo, product image, or portrait and get a clean transparent PNG with the background removed instantly. Powered by AI segmentation models that detect subjects with pixel-perfect accuracy. Works with complex backgrounds, hair, and semi-transparent objects. No signup needed, no watermarks.",
    category: "media",
    costTier: "huggingface",
    keywords: ["remove background", "background remover", "remove background from image free", "transparent background", "bg remover"],
    icon: "ImageMinus",
    relatedSlugs: ["image-compressor", "ai-image-generator", "image-to-text"],
    detailedDescription: [
      "Removing backgrounds from images used to require expensive software like Adobe Photoshop and hours of tedious manual work with the pen tool or magic wand. AllKit's free background remover changes that completely. You upload an image, and within seconds, AI analyzes every pixel to separate the foreground subject from the background. The result is a clean, transparent PNG that you can drop into any design, website, or presentation.",
      "The AI model behind this tool is trained on millions of images, so it handles tricky situations that would stump simpler tools. Think: flyaway hair strands, semi-transparent objects like wine glasses, complex patterns like chain-link fences, and subjects that blend into similar-colored backgrounds. It doesn't just draw a rough outline — it creates a precise, anti-aliased edge that looks natural when placed on any new background.",
      "This tool is built for everyone. E-commerce sellers use it to create clean product photos on white backgrounds. Designers use it to extract subjects for compositing. Social media managers use it to create profile pictures and thumbnails. Real estate photographers use it to replace dull skies. Students use it for school presentations. The use cases are endless, and it's completely free.",
      "Unlike most background removal services, AllKit doesn't add watermarks, doesn't require an account, and doesn't limit the number of images you can process. The AI runs on dedicated infrastructure, and your original image is processed and discarded — it's never stored or used for training."
    ],
    howToUse: [
      "Click the upload area or drag and drop an image onto the tool. You can use PNG, JPEG, or WebP files up to 10MB.",
      "Wait a few seconds while the AI model analyzes your image. A progress indicator shows the current status. If the model needs to warm up (first use of the day), it may take 30-60 seconds.",
      "Preview the result side-by-side with your original image. The transparent areas are shown with a checkerboard pattern so you can see exactly what was removed.",
      "If you're happy with the result, click the Download button to save the transparent PNG to your device.",
      "To process another image, simply upload a new one — there's no limit on how many images you can process.",
      "For best results, use images where the subject is clearly distinct from the background. Well-lit photos with good contrast produce the cleanest edges.",
      "If you need to compress the resulting PNG (transparent PNGs can be large), use our Image Compressor tool to reduce the file size without losing transparency."
    ],
    useCases: [
      { title: "E-commerce Product Photography", description: "Online marketplaces like Amazon, eBay, and Etsy require or strongly prefer product images with clean white backgrounds. Instead of setting up a professional photo studio, photograph products anywhere and remove the background in seconds." },
      { title: "Social Media Content Creation", description: "Create eye-catching profile pictures, YouTube thumbnails, Instagram stories, and TikTok content by extracting subjects and placing them on vibrant backgrounds, gradients, or other scenes." },
      { title: "Graphic Design and Compositing", description: "Isolate subjects from photos to create composite images, marketing materials, flyers, and digital art. Get a clean cutout that you can import into Figma, Canva, Photoshop, or any design tool." },
      { title: "Professional Headshots and Portraits", description: "Replace cluttered or unprofessional backgrounds in headshots with a solid color or corporate backdrop. Perfect for LinkedIn profiles, company websites, ID photos, and team pages." },
      { title: "Real Estate and Architecture", description: "Replace overcast skies with blue ones, remove distracting elements from property photos, or isolate buildings for presentations and proposals." },
      { title: "Presentations and Documents", description: "Extract images of people, products, or objects to use in PowerPoint presentations, Google Slides, reports, and educational materials without the rectangular photo boundary." },
      { title: "Print-on-Demand Merchandise", description: "Create transparent PNGs of designs for custom t-shirts, mugs, phone cases, and stickers. This tool lets you extract artwork and illustrations from any background for print-ready files." }
    ],
    technicalDetails: [
      "The background removal is powered by a U²-Net (U-square Net) deep learning model, specifically designed for salient object detection. Unlike general-purpose segmentation models, U²-Net has a nested U-structure that captures fine details at multiple scales, making it particularly effective at handling hair, fur, and semi-transparent edges.",
      "The model processes images at their native resolution up to 1024×1024 pixels. Larger images are automatically downscaled for processing and the resulting alpha mask is upscaled back to the original dimensions using high-quality interpolation.",
      "Output format is always PNG with an alpha channel (RGBA). The alpha channel contains smooth gradients at the edges rather than hard cutoffs, which produces natural-looking composites when the subject is placed on a new background.",
      "All processing happens on GPU-accelerated infrastructure via Hugging Face Spaces. Your image is sent to the model for inference, and the result is returned immediately. Images are not stored, logged, or used for any purpose beyond generating your result."
    ],
    faq: [
      { question: "How does the AI background remover work?", answer: "It uses a deep learning model called U²-Net that's trained specifically for salient object detection. The model analyzes every pixel in your image to determine whether it belongs to the foreground subject or the background, then creates a precise alpha mask to remove the background while preserving fine details like hair and semi-transparent objects." },
      { question: "What image formats and sizes are supported?", answer: "You can upload PNG, JPEG, and WebP images up to 10MB. The output is always a transparent PNG (RGBA). For best results, use images that are at least 500×500 pixels with the subject clearly visible." },
      { question: "Is this background remover really free? No watermarks?", answer: "Yes, completely free. There are no watermarks, no account required, and no hidden limits on the number of images you can process. The AI model runs on Hugging Face Spaces infrastructure at no cost to you." },
      { question: "Why does processing take longer sometimes?", answer: "The AI model runs on shared GPU infrastructure. If the model hasn't been used recently, it needs 30-60 seconds to load into GPU memory (called a 'cold start'). Once warm, subsequent images process in just a few seconds." },
      { question: "Can it handle hair and fur accurately?", answer: "Yes. The U²-Net model is specifically designed to handle fine details like individual hair strands, fur, feathers, and lace. It produces soft, anti-aliased edges rather than harsh cutoffs, so the result looks natural even on complex subjects." },
      { question: "Does it work with product photos?", answer: "Absolutely. Product photography is one of the most common use cases. The tool handles everything from jewelry and electronics to clothing and food. For best results, make sure the product is well-lit and clearly separated from the background." },
      { question: "Can I remove the background from multiple images at once?", answer: "Currently, the tool processes one image at a time. Upload your image, download the result, then upload the next one. Each image only takes a few seconds, so you can work through a batch quickly." },
      { question: "Is my image stored or used for AI training?", answer: "No. Your image is sent to the AI model for processing and the result is returned immediately. The original image and the result are not stored, logged, or used for model training." },
      { question: "What if the result isn't perfect?", answer: "The AI works excellently for most images, but can struggle with very low-contrast scenes where the subject blends into the background, extremely complex transparent objects, or images with multiple overlapping subjects. Use well-lit photos where the subject stands out for the best results." },
      { question: "How does this compare to Photoshop or remove.bg?", answer: "The quality is comparable to remove.bg and Photoshop's Select Subject feature. The main advantages of AllKit are: completely free with no watermarks, no per-image limits, no account required, and full-resolution output. Photoshop requires a paid subscription, and remove.bg watermarks free results." }
    ],
  },
  {
    slug: "image-to-text",
    name: "Image to Text (OCR)",
    description: "Extract text from images and screenshots using AI-powered OCR.",
    longDescription: "Upload an image, screenshot, or photo and extract all text content using advanced AI OCR. Supports multiple languages, handwriting recognition, and outputs clean Markdown. Perfect for digitizing documents, receipts, and screenshots.",
    category: "media",
    costTier: "huggingface",
    keywords: ["image to text", "ocr online", "image to text converter", "extract text from image", "screenshot to text"],
    icon: "ScanText",
    relatedSlugs: ["background-remover", "word-counter", "ai-image-generator"],
    faq: [
      { question: "What is OCR?", answer: "OCR (Optical Character Recognition) is a technology that reads text from images. Our AI-powered OCR goes beyond traditional methods — it understands layouts, tables, and even handwriting." },
      { question: "Can it read handwriting?", answer: "Yes. The AI model can recognize handwritten text, though accuracy depends on legibility. Printed text gives the best results." },
      { question: "What output format do I get?", answer: "The extracted text is returned as clean Markdown, preserving headings, lists, and table structures from the original image." },
    ],
  },
  {
    slug: "privacy-policy-generator",
    name: "Privacy Policy Generator",
    description: "Generate a professional privacy policy for your app or website using AI.",
    longDescription: "Describe your app or website and get a comprehensive, legally-informed privacy policy generated by AI. Covers GDPR, CCPA, cookies, data collection, third-party services, and more. Customizable and ready to publish.",
    category: "ai",
    costTier: "claude",
    keywords: ["privacy policy generator", "privacy policy generator free", "generate privacy policy", "privacy policy template"],
    icon: "Shield",
    relatedSlugs: ["word-counter", "lorem-ipsum", "regex-tester"],
    faq: [
      { question: "Is the generated privacy policy legally binding?", answer: "The AI generates a professionally worded policy based on best practices and common legal frameworks (GDPR, CCPA). However, you should have a lawyer review it before publishing for your specific jurisdiction." },
      { question: "What regulations does it cover?", answer: "The generated policy addresses GDPR (EU), CCPA (California), cookie consent, data collection practices, third-party services, children's privacy (COPPA), and data retention policies." },
      { question: "Can I customize the output?", answer: "Yes. The AI tailors the policy to your specific app or website based on what you describe — the technologies you use, data you collect, and services you integrate." },
    ],
  },
  {
    slug: "ai-image-generator",
    name: "AI Image Generator",
    description: "Generate images from text descriptions using AI. Free, no signup.",
    longDescription: "Describe what you want to see and AI generates it. Create illustrations, concept art, product mockups, and more. Powered by state-of-the-art diffusion models. Multiple styles and aspect ratios supported.",
    category: "media",
    costTier: "huggingface",
    keywords: ["ai image generator", "ai image generator free", "text to image", "ai art generator", "image generator"],
    icon: "Sparkles",
    relatedSlugs: ["background-remover", "image-compressor", "text-to-speech"],
    faq: [
      { question: "What AI model is used?", answer: "AllKit uses FLUX.1 Schnell, a fast diffusion model optimized for high-quality image generation. It generates 1024×1024 images in about 4 inference steps." },
      { question: "Can I use generated images commercially?", answer: "FLUX.1 Schnell is released under the Apache 2.0 license, which permits commercial use. However, always check the latest license terms for your specific use case." },
      { question: "How do I get better results?", answer: "Be specific in your prompts. Instead of 'a dog', try 'a golden retriever sitting in a sunlit meadow, professional photography, shallow depth of field'. Adding style cues and details improves output quality significantly." },
    ],
  },
  {
    slug: "cron-generator",
    name: "Cron Expression Generator",
    description: "Build and decode cron expressions visually. Describe your schedule in plain English and AI builds it.",
    longDescription: "Create cron expressions with an intuitive visual editor or describe your schedule in plain English and let AI generate the expression. See next run times, use common presets, and learn cron syntax with the built-in cheat sheet. Supports standard 5-field cron format.",
    category: "dev",
    costTier: "claude",
    keywords: ["cron expression generator", "crontab generator", "cron builder", "cron schedule", "crontab guru"],
    icon: "Clock",
    isNew: true,
    relatedSlugs: ["unix-timestamp", "regex-tester", "json-formatter"],
    faq: [
      { question: "What is a cron expression?", answer: "A cron expression is a string of 5 fields (minute, hour, day of month, month, day of week) that defines a schedule for running automated tasks. For example, '0 9 * * 1' means 'every Monday at 9:00 AM'." },
      { question: "How does the AI builder work?", answer: "Describe your schedule in plain English — like 'every weekday at 8am' or 'first Sunday of each month at midnight' — and AI generates the correct cron expression with an explanation." },
      { question: "What cron format is supported?", answer: "Standard 5-field cron format used by crontab on Linux/macOS, as well as most CI/CD platforms, cloud schedulers, and task runners." },
    ],
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes instantly.",
    longDescription: "Enter any text and instantly generate cryptographic hashes using MD5, SHA-1, SHA-256, SHA-384, and SHA-512 algorithms. All processing happens client-side using the Web Crypto API — your data never leaves your browser. Perfect for verifying file integrity, generating checksums, and security testing.",
    category: "dev",
    costTier: "free",
    keywords: ["hash generator", "md5 hash generator", "sha256 hash", "sha1 hash online", "hash generator online"],
    icon: "Hash",
    isNew: true,
    relatedSlugs: ["password-generator", "base64", "uuid-generator"],
    faq: [
      { question: "What is a hash?", answer: "A cryptographic hash is a fixed-size string generated from input data. The same input always produces the same hash, but you cannot reverse a hash back to the original data. Hashes are used for password storage, file integrity checks, and digital signatures." },
      { question: "Which hash algorithm should I use?", answer: "Use SHA-256 for most purposes — it's secure and widely supported. Avoid MD5 and SHA-1 for security-critical applications as they have known vulnerabilities. SHA-512 offers the highest security margin." },
      { question: "Is MD5 still safe to use?", answer: "MD5 is broken for security purposes — collisions can be generated in seconds. It's still fine for non-security uses like checksums or cache keys, but never use it for passwords or digital signatures." },
    ],
  },
  {
    slug: "color-palette",
    name: "Color Palette Generator",
    description: "Generate beautiful color palettes with harmony rules. Copy HEX, RGB, and HSL values.",
    longDescription: "Create stunning color palettes with one click. Generate random palettes, explore color harmonies (complementary, analogous, triadic, split-complementary), and lock colors you like. Copy values in HEX, RGB, or HSL format. Perfect for designers, developers, and anyone who works with color.",
    category: "dev",
    costTier: "free",
    keywords: ["color palette generator", "color scheme generator", "color palette", "color generator", "coolors alternative"],
    icon: "Palette",
    isNew: true,
    relatedSlugs: ["lorem-ipsum", "qr-code-generator", "json-formatter"],
    faq: [
      { question: "What are color harmonies?", answer: "Color harmonies are combinations of colors based on their positions on the color wheel. Complementary colors are opposite each other, analogous are adjacent, and triadic are evenly spaced. These rules help create visually pleasing palettes." },
      { question: "What's the difference between HEX, RGB, and HSL?", answer: "HEX (#FF5733) is a compact format used in CSS. RGB (255, 87, 51) defines colors by red, green, blue values. HSL (14°, 100%, 60%) uses hue, saturation, lightness — often more intuitive for picking colors." },
    ],
  },
  {
    slug: "lorem-ipsum",
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder text in paragraphs, sentences, or words. Classic lorem ipsum.",
    longDescription: "Generate lorem ipsum placeholder text quickly. Choose between paragraphs, sentences, or word count. Optionally start with the classic 'Lorem ipsum dolor sit amet...' opening. Copy to clipboard with one click. Ideal for mockups, wireframes, and prototyping.",
    category: "dev",
    costTier: "free",
    keywords: ["lorem ipsum generator", "lorem ipsum", "placeholder text generator", "dummy text generator", "lipsum"],
    icon: "Type",
    isNew: true,
    relatedSlugs: ["word-counter", "color-palette", "diff-checker"],
    faq: [
      { question: "What is Lorem Ipsum?", answer: "Lorem Ipsum is placeholder text used in design and publishing since the 1500s. It comes from a scrambled passage of Cicero's 'De Finibus Bonorum et Malorum' (45 BC). It's used because it has a natural letter distribution that resembles readable English." },
      { question: "Why use Lorem Ipsum instead of real text?", answer: "Placeholder text prevents reviewers from focusing on content instead of design. Lorem ipsum has no meaningful content, so it keeps attention on layout, typography, and visual hierarchy." },
    ],
  },
  {
    slug: "text-to-speech",
    name: "Text to Speech",
    description: "Convert text to natural-sounding speech using AI. Download as audio file.",
    longDescription: "Type or paste any text and convert it to realistic speech using AI. Powered by ChatterboxTTS for expressive, natural-sounding audio. Adjust expressiveness and temperature. Download the result as a WAV file. Free, no signup required.",
    category: "media",
    costTier: "huggingface",
    keywords: ["text to speech", "tts online", "text to speech online free", "ai voice generator", "text to audio"],
    icon: "Volume2",
    isNew: true,
    relatedSlugs: ["ai-image-generator", "word-counter", "image-to-text"],
    faq: [
      { question: "What AI model is used for TTS?", answer: "AllKit uses ChatterboxTTS by Resemble AI — a state-of-the-art model that produces natural, expressive speech with controllable tone and emotion." },
      { question: "What audio format is the output?", answer: "The generated speech is downloaded as a WAV file, which is a high-quality uncompressed audio format compatible with virtually all audio players and editors." },
      { question: "Can I adjust the voice style?", answer: "Yes. You can control expressiveness (how animated the speech sounds) and temperature (how creative/varied the pronunciation is). Lower values are more neutral, higher values more dramatic." },
    ],
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    description: "Generate QR codes from URLs, text, or data. Download as PNG or SVG.",
    longDescription: "Create QR codes instantly from any text, URL, email, phone number, or WiFi credentials. Customize colors and size. Download as high-resolution PNG. All processing happens client-side — your data never leaves your browser.",
    category: "dev",
    costTier: "free",
    keywords: ["qr code generator", "qr code generator free", "create qr code", "qr code maker", "free qr code"],
    icon: "QrCode",
    isNew: true,
    relatedSlugs: ["url-encoder", "password-generator", "uuid-generator"],
    detailedDescription: [
      "QR codes are everywhere — restaurant menus, business cards, product packaging, event tickets, payment terminals, and billboard advertisements. AllKit's QR Code Generator lets you create them instantly for free, right in your browser. Type a URL, paste some text, enter WiFi credentials, or provide contact details, and you get a scannable QR code in less than a second.",
      "Unlike many QR code generators that insert tracking links or require you to create an account, this tool generates static QR codes where your data is encoded directly into the pattern. That means the QR code works forever — it doesn't depend on any external service, can't be revoked, and doesn't track scans. What you encode is what the scanner reads, period.",
      "You can customize the QR code's size and colors to match your brand or design. Need a white QR code on a dark background? No problem. Want a specific hex color to match your company's brand guidelines? Just enter it. The tool generates high-resolution output that looks sharp whether it's displayed on a screen or printed on a poster.",
      "Everything happens locally in your browser. Your URLs, WiFi passwords, contact information, and text are never sent to any server. This makes it safe for encoding sensitive data like private network credentials, internal company URLs, or personal contact details."
    ],
    howToUse: [
      "Select the type of QR code you want to create: URL, plain text, email, phone number, or WiFi credentials. Each type has optimized input fields.",
      "Enter your content. For URLs, paste the full address including https://. For WiFi, enter the network name (SSID), password, and encryption type.",
      "The QR code generates automatically as you type. You'll see a live preview update with each keystroke.",
      "Customize the appearance if needed: adjust the size (in pixels), change the foreground and background colors, and set the error correction level.",
      "Download the QR code as a high-resolution PNG file by clicking the Download button. The file is ready to use in print or digital media.",
      "Test your QR code by scanning it with your phone's camera app before printing or publishing. This ensures the data is encoded correctly.",
      "For print materials, make sure the QR code is at least 2×2 cm (about 0.8×0.8 inches) and has good contrast between the foreground and background colors."
    ],
    useCases: [
      { title: "Business Cards and Networking", description: "Add a QR code to your business card that links to your website, LinkedIn profile, or a vCard with your full contact details. People can scan and save your info instantly instead of typing it manually." },
      { title: "Restaurant Menus and Retail", description: "Create QR codes for digital menus, product pages, or promotional offers. Customers scan the code with their phone and get instant access without downloading an app." },
      { title: "WiFi Network Sharing", description: "Generate a QR code with your WiFi network name and password. Guests scan it and connect automatically — no need to spell out complicated passwords. Perfect for offices, Airbnbs, cafes, and home networks." },
      { title: "Event Tickets and Check-in", description: "Encode ticket IDs, event URLs, or registration confirmations into QR codes. Attendees show the code at the door for quick scanning, eliminating paper tickets." },
      { title: "Marketing and Print Materials", description: "Add QR codes to flyers, posters, brochures, and product packaging to bridge physical and digital marketing. Link to landing pages, app downloads, video content, or social media profiles." },
      { title: "Payments and Invoicing", description: "Encode payment URLs (PayPal, Venmo, Stripe payment links) into QR codes for quick mobile payments at events, markets, or on invoices." },
      { title: "Inventory and Asset Tracking", description: "Generate unique QR codes for equipment, inventory items, or warehouse locations. Scan to pull up item details, maintenance logs, or tracking information in your system." }
    ],
    technicalDetails: [
      "QR (Quick Response) codes use the ISO/IEC 18004 standard. They encode data in a two-dimensional matrix of black and white squares called 'modules'. The tool supports all four error correction levels: L (7% recovery), M (15%), Q (25%), and H (30%), which determine how much of the code can be damaged while still being readable.",
      "The maximum data capacity depends on the encoding mode: 7,089 numeric characters, 4,296 alphanumeric characters, or 2,953 bytes of binary data. URLs are encoded in alphanumeric mode (case-insensitive) or byte mode (case-sensitive) depending on their content.",
      "QR codes include built-in features for reliable scanning: finder patterns (the three large squares in corners) for orientation detection, alignment patterns for perspective correction, and timing patterns for module grid calibration. This is why QR codes can be scanned at angles, from a distance, or when partially obscured.",
      "The tool generates QR codes client-side using JavaScript, producing either PNG raster output or SVG vector output. SVG is ideal for print (infinite scaling without quality loss), while PNG works best for screen display and messaging apps."
    ],
    faq: [
      { question: "What can I put in a QR code?", answer: "URLs, plain text, email addresses (mailto: links), phone numbers (tel: links), WiFi credentials (automatic connection), vCard contacts, SMS messages, and geographic coordinates. The QR standard can encode up to 4,296 alphanumeric characters." },
      { question: "What size should my QR code be for printing?", answer: "For print, use at least 2×2 cm (0.8×0.8 inches) at 300 DPI. For large-format printing like posters and banners, scale up proportionally. The more data encoded, the denser the pattern, so QR codes with long URLs need to be larger for reliable scanning." },
      { question: "Do QR codes expire?", answer: "Static QR codes (like the ones this tool generates) never expire. The data is encoded directly in the pattern — it doesn't depend on any external service. Dynamic QR codes from other services redirect through a URL and can expire if that service shuts down." },
      { question: "Can I customize the colors of my QR code?", answer: "Yes. You can change both the foreground (dark modules) and background colors. Just make sure there's enough contrast for scanners to read the code. A general rule: the foreground should be at least 40% darker than the background. Avoid using two similar colors." },
      { question: "How do I create a WiFi QR code?", answer: "Select the WiFi type, enter your network name (SSID), password, and encryption type (WPA/WPA2 is most common). The generated QR code follows the standard WiFi format that phones automatically recognize. When someone scans it, their phone prompts them to join the network." },
      { question: "Is my data safe? Are URLs tracked?", answer: "Everything happens in your browser — your data is never sent to any server. The QR codes are generated client-side using JavaScript. There's no tracking, no analytics, and no URL shortening. What you encode is exactly what the scanner reads." },
      { question: "What is error correction and which level should I use?", answer: "Error correction allows a QR code to be read even when partially damaged or obscured. Level L (Low, 7%) is fine for screens. Level M (Medium, 15%) is good for most printed materials. Level H (High, 30%) is best if the QR code might get dirty, scratched, or if you plan to place a logo over part of it." },
      { question: "Can I put a logo in the center of my QR code?", answer: "The tool doesn't add logos automatically, but you can overlay a small logo on the center of a QR code with high error correction (Level H). The error correction allows up to 30% of the code to be obscured, so a small centered logo will still scan fine. Use an image editor to place the logo after downloading." },
      { question: "PNG or SVG — which format should I download?", answer: "Use PNG for digital use (websites, social media, messaging apps). Use SVG for print (flyers, business cards, posters) because vector graphics scale to any size without pixelation." },
      { question: "Why won't my QR code scan?", answer: "Common issues: not enough contrast between foreground and background colors, QR code is too small for the scanning distance, too much data encoded (making modules very small), or the image is blurry. Try increasing the size, using black-on-white colors, or reducing the amount of encoded data." }
    ],
  },
  {
    slug: "diff-checker",
    name: "Diff Checker",
    description: "Compare two texts side-by-side and see the differences highlighted.",
    longDescription: "Paste two texts and instantly see a side-by-side comparison with additions, deletions, and modifications highlighted. Perfect for comparing code, config files, or any text. Supports line-by-line and word-by-word diff modes. All processing happens client-side.",
    category: "dev",
    costTier: "free",
    keywords: ["diff checker", "diff checker online", "text compare", "code diff", "compare text online"],
    icon: "GitCompareArrows",
    isNew: true,
    relatedSlugs: ["json-formatter", "word-counter", "regex-tester"],
    faq: [
      { question: "What is a diff?", answer: "A diff shows the differences between two pieces of text. Lines that were added appear in green, removed lines in red, and unchanged lines stay neutral. It's the same concept used in Git version control." },
      { question: "Can I compare code files?", answer: "Yes. The diff checker works with any plain text — code, config files, prose, CSV data, or any text format. It supports both line-by-line and word-by-word comparison modes." },
    ],
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    description: "Generate strong, secure passwords instantly. Customize length, characters, and complexity.",
    longDescription: "Create cryptographically secure passwords with full control over length, character types, and complexity. Generate multiple passwords at once, check entropy and strength ratings, and copy to clipboard. All generation happens client-side using the Web Crypto API — nothing is sent to any server.",
    category: "dev",
    costTier: "free",
    keywords: ["password generator", "random password generator", "strong password generator", "secure password generator", "password generator online"],
    icon: "KeyRound",
    isNew: true,
    relatedSlugs: ["hash-generator", "uuid-generator", "base64"],
    faq: [
      { question: "How long should my password be?", answer: "At least 16 characters for important accounts. Each additional character exponentially increases the time needed to crack it. A 20-character password with mixed character types is effectively unbreakable with current technology." },
      { question: "Are these passwords truly random?", answer: "Yes. We use the Web Crypto API (crypto.getRandomValues), which provides cryptographically secure random numbers. This is the same source of randomness used for TLS/SSL encryption." },
      { question: "Is it safe to generate passwords online?", answer: "Yes, because everything happens in your browser. No passwords are sent to any server, stored anywhere, or logged. You can verify this by disconnecting from the internet — the tool still works." },
    ],
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    description: "Count words, characters, sentences, and paragraphs. Reading time estimates.",
    longDescription: "Paste or type any text to get instant word count, character count, sentence count, paragraph count, and reading/speaking time estimates. See keyword density, most frequent words, and average word length. Perfect for writers, students, and SEO professionals. All processing happens in your browser.",
    category: "dev",
    costTier: "free",
    keywords: ["word counter", "character counter", "word count online", "letter counter", "word counter online"],
    icon: "FileText",
    isNew: true,
    relatedSlugs: ["lorem-ipsum", "diff-checker", "csv-json"],
    faq: [
      { question: "How is reading time calculated?", answer: "Reading time is based on the average adult reading speed of 200-250 words per minute. Speaking time uses 130-150 words per minute. These are averages — technical content takes longer, familiar topics faster." },
      { question: "What is keyword density?", answer: "Keyword density is how often a word appears as a percentage of total words. SEO professionals use it to ensure natural keyword usage — generally 1-3% is recommended. Higher density may appear spammy to search engines." },
    ],
  },
  {
    slug: "image-compressor",
    name: "Image Compressor",
    description: "Compress and resize images in your browser. Supports JPEG, PNG, and WebP.",
    longDescription: "Upload images and compress them instantly without uploading to any server. Adjust quality, resize dimensions, and convert between JPEG, PNG, and WebP formats. See before/after file size comparison with percentage saved. Batch compress multiple images at once. 100% client-side — your images never leave your device.",
    category: "media",
    costTier: "free",
    keywords: ["image compressor", "compress image online", "image compressor online", "reduce image size", "compress jpg online"],
    icon: "ImageDown",
    isNew: true,
    relatedSlugs: ["background-remover", "ai-image-generator", "image-resizer", "qr-code-generator"],
    faq: [
      { question: "Will compressing reduce image quality?", answer: "Slightly, but often imperceptibly. At 80% quality, JPEG images look virtually identical to the original while being 60-80% smaller. WebP format achieves even better compression at the same quality level." },
      { question: "Which format should I use?", answer: "WebP offers the best size-to-quality ratio and is supported by all modern browsers. Use JPEG for photos if you need maximum compatibility. Use PNG only when you need transparency." },
      { question: "Are my images uploaded anywhere?", answer: "No. All compression happens in your browser using the HTML5 Canvas API. Your images never leave your device — you can even use this tool offline." },
    ],
  },
  {
    slug: "image-resizer",
    name: "Image Resizer",
    description: "Resize images online for free. Set exact dimensions, use social media presets, and download as PNG or JPEG — all in your browser.",
    longDescription: "Resize any image to exact pixel dimensions instantly and for free. Upload a photo, set your target width and height (with optional aspect ratio lock), or pick from ready-made presets for Instagram, Twitter, Facebook, LinkedIn, YouTube thumbnails, and common screen resolutions. Choose output format (PNG or JPEG with adjustable quality), preview the result in real-time, and download — all processing happens client-side using the Canvas API so your images never leave your device. Supports batch resizing of multiple images at once.",
    category: "media",
    costTier: "free",
    keywords: ["image resizer", "resize image online", "photo resizer", "resize image", "image resizer online free", "resize photo online", "picture resizer"],
    icon: "Scaling",
    isNew: true,
    relatedSlugs: ["image-compressor", "background-remover", "ai-image-generator"],
    faq: [
      { question: "How do I resize an image online?", answer: "Upload your image by dragging it into the tool or clicking to browse. Enter your desired width and height in pixels, or choose a preset size (like 1080x1080 for Instagram). Click 'Resize All' and then download the result. The entire process takes seconds and happens in your browser." },
      { question: "Will resizing reduce image quality?", answer: "Resizing to smaller dimensions generally preserves quality well. When enlarging images (upscaling), some softness may appear because the browser interpolates new pixels. For JPEG output, you can control quality with the slider — 85-95% is recommended for a good balance of quality and file size." },
      { question: "What image formats are supported?", answer: "You can upload JPEG, PNG, and WebP images up to 50MB each. For output, choose between PNG (lossless, best for graphics and screenshots) or JPEG (smaller file size, best for photos). PNG preserves transparency while JPEG does not." },
      { question: "Can I resize multiple images at once?", answer: "Yes. Upload as many images as you want — either drag them all in at once or add more with the 'Add' button. All images will be resized to the same target dimensions when you click 'Resize All'. You can then download each individually or download all at once." },
      { question: "What is aspect ratio lock?", answer: "When aspect ratio lock is enabled (the default), changing the width automatically adjusts the height to maintain the original proportions, and vice versa. This prevents your image from looking stretched or squished. Toggle it off if you need exact non-proportional dimensions." },
      { question: "What are the best image sizes for social media?", answer: "Instagram post: 1080x1080, Instagram story: 1080x1920, Twitter/X post: 1200x675, Facebook post: 1200x630, LinkedIn post: 1200x627, YouTube thumbnail: 1280x720. All of these are available as one-click presets in the tool." },
      { question: "Is there a file size limit?", answer: "Each image can be up to 50MB. There is no limit on the number of images you can resize in a single session. Since all processing happens in your browser, the only constraint is your device's available memory." },
      { question: "Are my images uploaded to a server?", answer: "No. AllKit's Image Resizer is 100% client-side. Your images are processed entirely in your browser using the HTML5 Canvas API. Nothing is uploaded, stored, or transmitted. You can even use the tool offline after the page loads." },
      { question: "Can I resize an image to exact pixel dimensions?", answer: "Yes. Enter the exact width and height you need in pixels. If you want to maintain the aspect ratio, keep the lock toggle on and only change one dimension — the other will adjust automatically. Toggle the lock off to set both dimensions independently." },
      { question: "What is the difference between resizing and compressing?", answer: "Resizing changes the pixel dimensions of an image (e.g., from 4000x3000 to 1920x1080). Compressing reduces file size without changing dimensions by adjusting encoding quality. Often you want both — resize to your target dimensions and then choose a reasonable JPEG quality. AllKit offers both an Image Resizer and a dedicated Image Compressor." },
    ],
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode and inspect JSON Web Tokens. View header, payload, and expiration status.",
    longDescription: "Paste any JWT token to instantly decode and inspect its header, payload, and signature. See human-readable claim explanations, expiration status, and validation warnings. Color-coded token parts make it easy to understand the structure. Like jwt.io but faster and cleaner. All decoding happens client-side.",
    category: "dev",
    costTier: "free",
    keywords: ["jwt decoder", "jwt decode", "jwt.io", "json web token decoder", "jwt token decoder"],
    icon: "ShieldCheck",
    isNew: true,
    relatedSlugs: ["json-formatter", "base64", "hash-generator"],
    faq: [
      { question: "What is a JWT?", answer: "A JSON Web Token (JWT) is a compact, URL-safe token format used for authentication and information exchange. It contains three parts: a header (algorithm info), payload (claims/data), and signature (verification)." },
      { question: "Is it safe to paste my JWT here?", answer: "Yes. Decoding happens entirely in your browser — the token is never sent to any server. However, note that JWTs are only encoded (Base64), not encrypted — anyone with the token can read its contents." },
      { question: "Can this tool verify JWT signatures?", answer: "This tool decodes and displays JWT contents but does not verify signatures, as that requires the secret key or public key used to sign the token. It will flag expired tokens and show all claims." },
    ],
  },
  {
    slug: "unix-timestamp",
    name: "Unix Timestamp Converter",
    description: "Convert Unix timestamps to human-readable dates and vice versa. Supports seconds and milliseconds.",
    longDescription: "Convert between Unix timestamps and human-readable dates instantly. Supports both seconds and milliseconds formats, with automatic detection. See results in local time, UTC, ISO 8601, and relative format. Includes current timestamp display and common timestamp references. All processing happens client-side.",
    category: "dev",
    costTier: "free",
    keywords: ["unix timestamp converter", "epoch converter", "timestamp to date", "unix time converter", "epoch to date"],
    icon: "Clock",
    isNew: true,
    relatedSlugs: ["cron-generator", "json-formatter", "uuid-generator"],
    faq: [
      { question: "What is a Unix timestamp?", answer: "A Unix timestamp (also called epoch time) is the number of seconds that have elapsed since January 1, 1970, 00:00:00 UTC. It's used universally in programming to represent dates and times as a single number." },
      { question: "What is the Year 2038 problem?", answer: "32-bit systems store Unix timestamps as signed 32-bit integers, which max out at 2,147,483,647 (January 19, 2038, 03:14:07 UTC). After this, the value overflows. Most modern systems use 64-bit timestamps, which last until the year 292 billion." },
      { question: "Seconds or milliseconds?", answer: "Unix timestamps in seconds have 10 digits (e.g., 1700000000). JavaScript and Java typically use milliseconds (13 digits, e.g., 1700000000000). This tool auto-detects the format." },
    ],
  },
  {
    slug: "url-encoder",
    name: "URL Encode / Decode",
    description: "Encode and decode URLs and query strings instantly. Supports encodeURIComponent and encodeURI.",
    longDescription: "Encode and decode URLs, query parameters, and special characters instantly. Choose between encodeURIComponent (encodes everything) and encodeURI (preserves URL structure). Includes a reference table of common URL encodings. All processing happens in your browser — no data is sent to any server.",
    category: "dev",
    costTier: "free",
    keywords: ["url encoder", "url decoder", "url encode online", "url decode online", "percent encoding"],
    icon: "Link",
    isNew: true,
    relatedSlugs: ["base64", "json-formatter", "qr-code-generator"],
    faq: [
      { question: "Why do URLs need encoding?", answer: "URLs can only contain a limited set of ASCII characters. Special characters like spaces, &, =, and non-ASCII characters must be percent-encoded (e.g., space becomes %20) to be safely transmitted in URLs." },
      { question: "What's the difference between encodeURI and encodeURIComponent?", answer: "encodeURI preserves URL-structural characters like :, /, ?, # — use it for complete URLs. encodeURIComponent encodes everything except letters and digits — use it for query parameter values." },
      { question: "What is percent encoding?", answer: "Percent encoding (also called URL encoding) replaces unsafe characters with a % followed by their hexadecimal ASCII value. For example, a space becomes %20, & becomes %26." },
    ],
  },
  {
    slug: "csv-json",
    name: "CSV to JSON Converter",
    description: "Convert CSV to JSON and JSON to CSV. Supports custom delimiters, file upload, and download.",
    longDescription: "Convert between CSV and JSON formats instantly. Supports comma, semicolon, tab, and pipe delimiters. Upload CSV or JSON files, or paste data directly. Download converted output as a file. Handles quoted fields, escaped characters, and large datasets. All processing happens client-side — your data never leaves your browser.",
    category: "dev",
    costTier: "free",
    keywords: ["csv to json", "json to csv", "csv to json converter", "convert csv to json online", "json to csv converter"],
    icon: "FileSpreadsheet",
    isNew: true,
    relatedSlugs: ["json-formatter", "diff-checker", "word-counter"],
    faq: [
      { question: "What delimiter should I use?", answer: "Comma is the standard for CSV files. Use semicolon if your data contains commas (common in European locales). Tab-separated is great for data copied from spreadsheets. Pipe is used in some legacy systems." },
      { question: "Can it handle quoted fields?", answer: "Yes. The parser correctly handles fields wrapped in double quotes, including fields that contain commas, newlines, or escaped quotes within the quoted value." },
      { question: "Is there a file size limit?", answer: "There's no hard limit since processing happens in your browser, but very large files (>50MB) may cause your browser to slow down. For typical CSV files (thousands of rows), it works instantly." },
    ],
  },
  {
    slug: "markdown-preview",
    name: "Markdown Preview",
    description: "Write Markdown and see rendered HTML in real-time. Split, source, and preview modes.",
    longDescription: "A live Markdown editor with instant preview. Write Markdown on one side and see beautifully rendered HTML on the other. Supports headers, bold, italic, links, images, code blocks, lists, blockquotes, and more. Copy rendered HTML with one click. Split view, source-only, and preview-only modes. All processing happens client-side.",
    category: "dev",
    costTier: "free",
    keywords: ["markdown preview", "markdown editor online", "markdown to html", "markdown viewer", "markdown renderer"],
    icon: "FileCode",
    isNew: true,
    relatedSlugs: ["diff-checker", "word-counter", "lorem-ipsum", "json-formatter"],
    faq: [
      { question: "What is Markdown?", answer: "Markdown is a lightweight markup language for creating formatted text using plain text syntax. Created by John Gruber in 2004, it's widely used for documentation, README files, blog posts, and messaging. It's simpler than HTML but converts to HTML seamlessly." },
      { question: "What Markdown features are supported?", answer: "Headers (h1-h4), bold, italic, strikethrough, links, images, code blocks, inline code, ordered and unordered lists, blockquotes, horizontal rules, and more." },
      { question: "Can I copy the rendered HTML?", answer: "Yes. Click 'Copy HTML' to copy the generated HTML markup to your clipboard, ready to paste into any website or CMS." },
    ],
  },
  {
    slug: "yaml-json",
    name: "YAML to JSON Converter",
    description: "Convert YAML to JSON and JSON to YAML instantly. Bidirectional, no dependencies.",
    longDescription: "Convert between YAML and JSON formats in real-time. Paste YAML and get formatted JSON, or paste JSON and get clean YAML. Handles nested objects, arrays, strings, numbers, booleans, and null values. Swap between modes with one click. All conversion happens client-side — your data never leaves your browser.",
    category: "dev",
    costTier: "free",
    keywords: ["yaml to json", "json to yaml", "yaml to json converter", "convert yaml to json online", "yaml converter"],
    icon: "FileJson",
    isNew: true,
    relatedSlugs: ["json-formatter", "csv-json", "diff-checker"],
    faq: [
      { question: "What is YAML?", answer: "YAML (YAML Ain't Markup Language) is a human-readable data serialization format. It's commonly used for configuration files (Docker Compose, Kubernetes, GitHub Actions, CI/CD pipelines). Unlike JSON, YAML uses indentation instead of braces and supports comments." },
      { question: "When should I use YAML vs JSON?", answer: "Use YAML for configuration files that humans edit frequently — it's more readable and supports comments. Use JSON for data exchange between systems, API responses, and when you need strict parsing. JSON is a subset of YAML, so any valid JSON is also valid YAML." },
      { question: "Does it handle complex YAML?", answer: "It handles the most common YAML features: nested objects, arrays, strings, numbers, booleans, null, inline arrays, and comments. Advanced features like anchors, aliases, and multi-document streams are not yet supported." },
    ],
  },
  {
    slug: "css-minifier",
    name: "CSS Minifier & Beautifier",
    description: "Minify CSS to reduce file size or beautify it for readability. Free online CSS formatter and compressor.",
    longDescription: "Minify your CSS to dramatically reduce file size and speed up page load times, or beautify minified CSS into clean, readable code. This free online CSS minifier removes comments, collapses whitespace, shortens hex colors (#ffffff to #fff), eliminates unnecessary semicolons, and optimizes zero values. The beautifier properly indents nested rules, @media queries, and @keyframes. Handles CSS variables, complex selectors, and all modern CSS features. See real-time size comparison with percentage saved. All processing happens 100% client-side — your CSS never leaves your browser.",
    category: "dev",
    costTier: "free",
    keywords: ["css minifier", "css beautifier", "minify css online", "css formatter", "css compressor", "css minify", "compress css online", "css prettifier"],
    icon: "Paintbrush",
    isNew: true,
    relatedSlugs: ["json-formatter", "html-entities", "diff-checker", "markdown-preview"],
    faq: [
      { question: "What is CSS minification?", answer: "CSS minification is the process of removing unnecessary characters from CSS code without changing its functionality. This includes whitespace, comments, unnecessary semicolons, and shortening values like hex colors. Minified CSS loads faster because the browser downloads a smaller file." },
      { question: "How much can CSS minification reduce file size?", answer: "Typical CSS minification reduces file size by 20-50%, depending on how the original CSS was written. Files with many comments and generous whitespace see the largest reductions. Even a 30% reduction significantly improves page load speed, especially on mobile networks." },
      { question: "Does minification change how my CSS works?", answer: "No. Minification only removes characters that have no effect on how the browser interprets your styles. The visual output of your website remains identical. It is a safe, lossless optimization used by virtually every production website." },
      { question: "What is CSS beautification?", answer: "CSS beautification (also called formatting or prettifying) is the opposite of minification. It takes compact or minified CSS and adds proper indentation, line breaks, and spacing to make the code human-readable. Useful when you need to read or edit minified production CSS." },
      { question: "Should I minify CSS for production?", answer: "Yes, absolutely. Minifying CSS is a standard web performance best practice. Smaller CSS files mean faster downloads, quicker rendering, and better Core Web Vitals scores. Most build tools (Webpack, Vite, Next.js) do this automatically, but this tool is useful for quick one-off minification." },
      { question: "Is my CSS data safe?", answer: "Yes. All minification and beautification happens entirely in your browser using JavaScript. Your CSS code is never sent to any server, never stored, and never logged. You can verify this by disconnecting from the internet — the tool still works." },
      { question: "Does this handle @media queries and @keyframes?", answer: "Yes. The minifier and beautifier correctly handle @media queries, @keyframes animations, CSS variables (custom properties), nested selectors, and all standard CSS at-rules. Complex selectors and combinators are preserved correctly." },
      { question: "What CSS optimizations does the minifier perform?", answer: "The minifier removes comments, collapses whitespace, removes spaces around selectors and properties, shortens 6-digit hex colors to 3-digit when possible (#ffffff to #fff), removes trailing semicolons before closing braces, converts 0px/0em/0rem to plain 0, and removes leading zeros from decimal values (0.5 to .5)." },
      { question: "Can I use this for SCSS or LESS?", answer: "This tool is designed for standard CSS. While it may work partially with SCSS or LESS syntax, the variable syntax ($var, @var) and nested rules in preprocessors may not be handled correctly. Compile your SCSS/LESS to CSS first, then minify the output." },
      { question: "How does CSS file size affect website performance?", answer: "CSS is a render-blocking resource — the browser cannot display the page until all CSS is downloaded and parsed. Larger CSS files delay the First Contentful Paint (FCP) and Largest Contentful Paint (LCP), two key Core Web Vitals metrics. Minifying CSS directly improves these scores." },
    ],
  },
  {
    slug: "html-entities",
    name: "HTML Entity Encoder / Decoder",
    description: "Encode and decode HTML entities. Convert special characters to their HTML entity equivalents.",
    longDescription: "Convert special characters like <, >, &, and quotes to their HTML entity equivalents and back. Supports named entities (&amp;, &lt;, &copy;), decimal entities (&#169;), and hexadecimal entities (&#xA9;). Includes a reference table of common HTML entities. Essential for web developers working with HTML content. All processing is client-side.",
    category: "dev",
    costTier: "free",
    keywords: ["html entity encoder", "html entity decoder", "html entities", "html encode online", "html special characters"],
    icon: "Code",
    isNew: true,
    relatedSlugs: ["url-encoder", "base64", "json-formatter"],
    faq: [
      { question: "What are HTML entities?", answer: "HTML entities are special codes used to represent characters that have special meaning in HTML. For example, < becomes &lt; because the browser would otherwise interpret it as the start of an HTML tag. They're also used for characters not on a standard keyboard, like © (&copy;) or € (&euro;)." },
      { question: "When do I need to encode HTML entities?", answer: "Whenever you display user-generated content in HTML, you must encode entities to prevent XSS (Cross-Site Scripting) attacks. Also when including special characters in HTML attributes, or when your content contains characters like <, >, &, or quotes." },
      { question: "What's the difference between named and numeric entities?", answer: "Named entities use readable names like &amp; or &copy;. Numeric entities use the character's Unicode code point: &#38; (decimal) or &#x26; (hex). Named entities are easier to read, but numeric entities can represent any Unicode character." },
    ],
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return tools.filter((t) => t.category === category);
}

export const categoryLabels: Record<ToolCategory, string> = {
  dev: "Developer Tools",
  media: "AI Media Tools",
  ai: "AI-Powered Tools",
};
