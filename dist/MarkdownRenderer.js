"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownRenderer = void 0;
class MarkdownRenderer {
    constructor(containerId) {
        const element = document.getElementById(containerId);
        if (!element) {
            throw new Error(`Container element with id '${containerId}' not found`);
        }
        this.container = element;
    }
    render(markdown) {
        // Configure marked options for syntax highlighting
        marked.setOptions({
            highlight: function (code, lang) {
                // You could integrate a syntax highlighter like Prism.js here
                return code;
            }
        });
        // Convert markdown to HTML
        const html = marked.parse(markdown);
        // Set the HTML content
        this.container.innerHTML = html;
        // Apply some basic styling
        this.applyStyles();
    }
    applyStyles() {
        // Add some basic styles to make the markdown look better
        const style = document.createElement('style');
        style.textContent = `
            .markdown-container {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }

            .markdown-container h1 {
                border-bottom: 2px solid #eaecef;
                padding-bottom: 0.3em;
            }

            .markdown-container h2 {
                border-bottom: 1px solid #eaecef;
                padding-bottom: 0.3em;
            }

            .markdown-container code {
                background-color: #f6f8fa;
                padding: 0.2em 0.4em;
                border-radius: 3px;
                font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
            }

            .markdown-container pre {
                background-color: #f6f8fa;
                padding: 16px;
                border-radius: 6px;
                overflow: auto;
            }

            .markdown-container pre code {
                background-color: transparent;
                padding: 0;
            }

            .markdown-container ul, .markdown-container ol {
                padding-left: 2em;
            }

            .markdown-container blockquote {
                margin: 0;
                padding-left: 1em;
                border-left: 0.25em solid #dfe2e5;
                color: #6a737d;
            }
        `;
        document.head.appendChild(style);
    }
}
exports.MarkdownRenderer = MarkdownRenderer;
