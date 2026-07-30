const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

// Initialize markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

// Read README.md
const readmePath = path.join(__dirname, '../README.md');
const readmeContent = fs.readFileSync(readmePath, 'utf-8');

// Convert to HTML
const htmlContent = md.render(readmeContent);

// Create complete HTML document with styling
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Noah Weidig - GIS & Data Scientist">
    <meta name="theme-color" content="#1a1a1a">
    <title>Noah Weidig - GIS & Data Scientist</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --bg-primary: #ffffff;
            --bg-secondary: #f5f5f5;
            --text-primary: #1a1a1a;
            --text-secondary: #666666;
            --border-color: #e0e0e0;
            --accent-color: #0066cc;
            --accent-hover: #0052a3;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --bg-primary: #1a1a1a;
                --bg-secondary: #2a2a2a;
                --text-primary: #ffffff;
                --text-secondary: #b0b0b0;
                --border-color: #404040;
                --accent-color: #4d94ff;
                --accent-hover: #80b3ff;
            }
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            background-color: var(--bg-primary);
            transition: background-color 0.3s, color 0.3s;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
        }

        /* Typography */
        h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            line-height: 1.3;
            font-weight: 600;
        }

        h1 {
            font-size: 2.5rem;
            color: var(--text-primary);
        }

        h2 {
            font-size: 2rem;
            color: var(--text-primary);
            border-bottom: 2px solid var(--accent-color);
            padding-bottom: 0.5rem;
        }

        h3 {
            font-size: 1.5rem;
            color: var(--accent-color);
        }

        h4, h5, h6 {
            font-size: 1.1rem;
            color: var(--text-secondary);
        }

        p {
            margin-bottom: 1rem;
            color: var(--text-secondary);
        }

        a {
            color: var(--accent-color);
            text-decoration: none;
            transition: color 0.2s;
            border-bottom: 1px solid transparent;
        }

        a:hover {
            color: var(--accent-hover);
            border-bottom-color: var(--accent-hover);
        }

        /* Images */
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1.5rem 0;
        }

        /* Code */
        code {
            background-color: var(--bg-secondary);
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
        }

        pre {
            background-color: var(--bg-secondary);
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
            margin-bottom: 1rem;
            border-left: 3px solid var(--accent-color);
        }

        pre code {
            background: none;
            padding: 0;
        }

        /* Lists */
        ul, ol {
            margin-left: 2rem;
            margin-bottom: 1rem;
        }

        li {
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
        }

        /* Blockquotes */
        blockquote {
            border-left: 4px solid var(--accent-color);
            padding-left: 1rem;
            margin: 1.5rem 0;
            color: var(--text-secondary);
            font-style: italic;
        }

        /* Horizontal Rules */
        hr {
            border: none;
            border-top: 2px solid var(--border-color);
            margin: 2rem 0;
        }

        /* Dividers */
        div[align="center"] {
            text-align: center;
            margin: 2rem 0;
        }

        /* Badges and badges in badges container */
        div[align="center"] img {
            display: inline-block;
            margin: 0.5rem 0.25rem;
            vertical-align: middle;
            height: 40px;
        }

        /* Links as keyboard buttons */
        kbd {
            background-color: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 0.4em 0.6em;
            font-family: monospace;
            font-size: 0.9em;
            display: inline-block;
            margin: 0 0.2em;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
        }

        th {
            background-color: var(--bg-secondary);
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid var(--border-color);
        }

        td {
            padding: 0.75rem;
            border-bottom: 1px solid var(--border-color);
        }

        tr:hover {
            background-color: var(--bg-secondary);
        }

        /* Footer */
        footer {
            text-align: center;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 2px solid var(--border-color);
            color: var(--text-secondary);
            font-size: 0.9rem;
        }

        /* Utility classes */
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }

            h1 {
                font-size: 2rem;
            }

            h2 {
                font-size: 1.5rem;
            }

            h3 {
                font-size: 1.25rem;
            }

            div[align="center"] img {
                height: 32px;
            }
        }

        /* Print styles */
        @media print {
            body {
                background: white;
                color: black;
            }

            a {
                color: #0066cc;
            }

            a::after {
                content: " (" attr(href) ")";
            }
        }

        /* Animation on load */
        .container {
            animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        ${htmlContent}
    </div>
    <footer>
        <p>Generated by <a href="https://github.com/features/actions">GitHub Actions</a> • Last updated on <time>${new Date().toLocaleDateString()}</time></p>
    </footer>
</body>
</html>`;

// Write output
const outputPath = path.join(__dirname, '../index.html');
fs.writeFileSync(outputPath, html, 'utf-8');
console.log(`✓ README rendered to ${outputPath}`);
