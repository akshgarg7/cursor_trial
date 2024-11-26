"use strict";
const blogpostMarkdown = `# control

*humans should focus on bigger problems*

## Setup

\`\`\`bash
git clone git@github.com:anysphere/control
\`\`\`

\`\`\`bash
./init.sh
\`\`\`

## Folder structure

**The most important folders are:**

1. \`vscode\`: this is our fork of vscode, as a submodule.
2. \`milvus\`: this is where our Rust server code lives.
3. \`schema\`: this is our Protobuf definitions for communication between the client and the server.

Each of the above folders should contain fairly comprehensive README files; please read them. If something is missing, or not working, please add it to the README!

Some less important folders:

1. \`release\`: this is a collection of scripts and guides for releasing various things.
2. \`infra\`: infrastructure definitions for the on-prem deployment.
3. \`third_party\`: where we keep our vendored third party dependencies.

## Miscellaneous things that may or may not be useful

##### Where to find rust-proto definitions

They are in a file called \`aiserver.v1.rs\`. It might not be clear where that file is. Run \`rg --files --no-ignore bazel-out | rg aiserver.v1.rs\` to find the file.

## Releasing

Within \`vscode/\`:

- Bump the version
- Then:

\`\`\`
git checkout build-todesktop
git merge main
git push origin build-todesktop
\`\`\`

- Wait for 14 minutes for gulp and ~30 minutes for todesktop
- Go to todesktop.com, test the build locally and hit release
`;
let currentContainer = null;
// Do not edit this method
function runStream() {
    currentContainer = document.getElementById('markdownContainer');
    // this randomly split the markdown into tokens between 2 and 20 characters long
    // simulates the behavior of an ml model thats giving you weirdly chunked tokens
    const tokens = [];
    let remainingMarkdown = blogpostMarkdown;
    while (remainingMarkdown.length > 0) {
        const tokenLength = Math.floor(Math.random() * 18) + 2;
        const token = remainingMarkdown.slice(0, tokenLength);
        tokens.push(token);
        remainingMarkdown = remainingMarkdown.slice(tokenLength);
    }
    const toCancel = setInterval(() => {
        const token = tokens.shift();
        if (token) {
            addToken(token);
        }
        else {
            clearInterval(toCancel);
        }
    }, 20);
}
let inCodeBlock = false;
let inInlineCode = false;
let codeBlockBuffer = "";
let inlineCodeBuffer = "";
let partialBackticks = ""; // To track incomplete backticks
let codeBlockLanguage = ""; // To store code block language if specified
let currentCodeBlockElement = null; // Reference to the current <pre> element
let currentInlineCodeElement = null; // Reference to the current <code> element
function addToken(token) {
    if (!currentContainer)
        return;
    let i = 0;
    while (i < token.length) {
        const char = token[i];
        // Accumulate backticks to handle cases where backticks are split across tokens
        if (char === '`') {
            partialBackticks += '`';
            i++;
            continue;
        }
        // If we have accumulated backticks, determine if we should enter or exit code
        if (partialBackticks.length > 0) {
            if (partialBackticks === '```') {
                // Handle code block
                inCodeBlock = !inCodeBlock;
                partialBackticks = '';
                if (inCodeBlock) {
                    // Beginning of code block
                    currentCodeBlockElement = document.createElement('pre');
                    currentCodeBlockElement.style.backgroundColor = '#f4f4f4'; // Light gray for visibility
                    currentContainer.appendChild(currentCodeBlockElement);
                    // Check for language specifier
                    let lang = '';
                    let j = i;
                    while (j < token.length && token[j] !== '\n') {
                        lang += token[j];
                        j++;
                    }
                    i = j;
                    codeBlockLanguage = lang.trim();
                }
                else {
                    // End of code block
                    currentCodeBlockElement = null;
                    codeBlockBuffer = '';
                    codeBlockLanguage = '';
                }
            }
            else if (partialBackticks === '`') {
                // Handle inline code
                inInlineCode = !inInlineCode;
                partialBackticks = '';
                if (inInlineCode) {
                    // Beginning of inline code
                    currentInlineCodeElement = document.createElement('code');
                    currentInlineCodeElement.style.backgroundColor = '#eef'; // Light blue for visibility
                    currentContainer.appendChild(currentInlineCodeElement);
                }
                else {
                    // End of inline code
                    currentInlineCodeElement = null;
                    inlineCodeBuffer = '';
                }
            }
            else {
                // Wait for more backticks if we have less than 3
                i++;
                continue;
            }
            continue;
        }
        // Not dealing with backticks, handle content
        if (inCodeBlock) {
            if (currentCodeBlockElement) {
                // Append character to the current <pre> element
                currentCodeBlockElement.innerText += char;
            }
            else {
                // This shouldn't happen, but handle gracefully
                codeBlockBuffer += char;
            }
        }
        else if (inInlineCode) {
            if (currentInlineCodeElement) {
                // Append character to the current <code> element
                currentInlineCodeElement.innerText += char;
            }
            else {
                // This shouldn't happen, but handle gracefully
                inlineCodeBuffer += char;
            }
        }
        else {
            // Regular text
            const span = document.createElement('span');
            span.innerText = char;
            currentContainer.appendChild(span);
        }
        i++;
    }
}
