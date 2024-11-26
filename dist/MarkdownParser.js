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
// Parser states
var ParserState;
(function (ParserState) {
    ParserState[ParserState["NORMAL"] = 0] = "NORMAL";
    ParserState[ParserState["INLINE_CODE"] = 1] = "INLINE_CODE";
    ParserState[ParserState["CODE_BLOCK"] = 2] = "CODE_BLOCK";
    ParserState[ParserState["POTENTIAL_CODE_BLOCK"] = 3] = "POTENTIAL_CODE_BLOCK"; // For handling partial triple backticks
})(ParserState || (ParserState = {}));
// Global state
let currentState = ParserState.NORMAL;
let backtickCount = 0;
let currentSpan = null;
function addToken(token) {
    if (!currentContainer)
        return;
    // Process the token character by character to handle state transitions
    for (let i = 0; i < token.length; i++) {
        const char = token[i];
        if (char === '`') {
            backtickCount++;
            // Handle state transitions
            if (backtickCount === 3) {
                // Complete triple backtick
                backtickCount = 0;
                if (currentState === ParserState.CODE_BLOCK) {
                    currentState = ParserState.NORMAL;
                }
                else {
                    currentState = ParserState.CODE_BLOCK;
                }
                currentSpan = null;
            }
            else if (backtickCount === 1 && currentState === ParserState.NORMAL) {
                // Start of inline code
                currentState = ParserState.INLINE_CODE;
                currentSpan = null;
            }
            else if (backtickCount === 1 && currentState === ParserState.INLINE_CODE) {
                // End of inline code
                currentState = ParserState.NORMAL;
                currentSpan = null;
            }
        }
        else {
            // Reset backtick count if we see non-backtick character
            backtickCount = 0;
        }
        // Create new span if needed
        if (!currentSpan) {
            currentSpan = document.createElement('span');
            if (currentState === ParserState.INLINE_CODE) {
                currentSpan.style.backgroundColor = '#f0f0f0';
                currentSpan.style.fontFamily = 'monospace';
                currentSpan.style.padding = '2px';
            }
            else if (currentState === ParserState.CODE_BLOCK) {
                currentSpan.style.backgroundColor = '#f5f5f5';
                currentSpan.style.fontFamily = 'monospace';
                currentSpan.style.display = 'block';
                currentSpan.style.padding = '10px';
            }
            currentContainer.appendChild(currentSpan);
        }
        // Add the character to current span
        currentSpan.innerText += char;
    }
}
