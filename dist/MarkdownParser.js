"use strict";
const blogpostMarkdown = `# control

*humans should focus on bigger problems*

## Setup

\`\`\`bash
git clone git@github.com:anysphere/control
git clone git@github.com:anysphere/control
git clone git@github.com:anysphere/control
git clone git@github.com:anysphere/control
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
let languageBuffer = ""; // Add this with other state variables at the top
let currentCodeBlockElement = null; // Reference to the current <pre> element
let currentInlineCodeElement = null; // Reference to the current <code> element
// Add these with your other state variables
let inHeading = false;
let headingLevel = 0;
let currentHeadingElement = null;
function addToken(token) {
    if (!currentContainer)
        return;
    let i = 0;
    while (i < token.length) {
        const char = token[i];
        // Handle backticks first
        if (char === '`') {
            partialBackticks += '`';
            i++;
            continue;
        }
        // Process accumulated backticks
        if (partialBackticks.length > 0) {
            if (partialBackticks === '```') {
                // Handle code block
                inCodeBlock = !inCodeBlock;
                partialBackticks = '';
                if (inCodeBlock) {
                    // Create a wrapper div for the code block and language label
                    const codeWrapper = document.createElement('div');
                    codeWrapper.style.backgroundColor = '#1e1e1e';
                    codeWrapper.style.borderRadius = '4px';
                    codeWrapper.style.marginBottom = '1em';
                    // Create language label div
                    const languageLabel = document.createElement('div');
                    languageLabel.style.padding = '4px 8px';
                    languageLabel.style.color = '#ffffff';
                    languageLabel.style.fontSize = '12px';
                    // Create the pre element inside the wrapper
                    currentCodeBlockElement = document.createElement('pre');
                    currentCodeBlockElement.style.backgroundColor = '#1e1e1e';
                    currentCodeBlockElement.style.margin = '0';
                    currentCodeBlockElement.style.padding = '12px';
                    currentCodeBlockElement.style.color = '#ffffff';
                    // Check if the next character is a newline - if so, use "plain text"
                    if (i < token.length && token[i] === '\n') {
                        codeBlockLanguage = 'plain text';
                        languageLabel.textContent = '# plain text';
                        i++; // Skip the newline
                    }
                    codeWrapper.appendChild(languageLabel);
                    codeWrapper.appendChild(currentCodeBlockElement);
                    currentContainer.appendChild(codeWrapper);
                    languageBuffer = '';
                }
                else {
                    // End of code block
                    currentCodeBlockElement = null;
                    codeBlockBuffer = '';
                    codeBlockLanguage = '';
                    languageBuffer = '';
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
                i++;
                continue;
            }
            continue;
        }
        // If we're in a code block or inline code, handle that first
        if (inCodeBlock) {
            if (currentCodeBlockElement) {
                // console.log("inCodeBlock", char);
                // if (char === '\n') {
                //     console.log("newline");
                // }
                if (codeBlockLanguage === '') {
                    // console.log("languageBuffer", languageBuffer);
                    // Buffer characters until we hit a newline
                    console.log("char", char);
                    if (char === '\n') {
                        console.log("entering the codeblock");
                        console.log("languageBuffer", languageBuffer);
                        codeBlockLanguage = languageBuffer.trim();
                        // Update the language label text when we detect the language
                        const wrapper = currentCodeBlockElement.parentElement;
                        if (wrapper) {
                            const label = wrapper.firstChild;
                            // If no language was specified, use "plain text"
                            label.textContent = codeBlockLanguage ? `# ${codeBlockLanguage}` : '# plain text';
                        }
                        languageBuffer = '';
                        i++; // Skip the newline character
                        continue; // Don't add the newline to the content
                    }
                    else {
                        languageBuffer += char;
                        i++;
                        continue;
                    }
                }
                // Append character to the current <pre> element
                currentCodeBlockElement.innerText += char;
            }
            else {
                // This shouldn't happen, but handle gracefully
                codeBlockBuffer += char;
            }
            i++;
            continue;
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
            i++;
            continue;
        }
        // Now handle headings (only if we're not in any code section)
        if (char === '#' && (!inHeading || headingLevel === 0)) {
            inHeading = true;
            headingLevel++;
            i++;
            continue;
        }
        // If we're counting heading level and see a space, create the heading
        if (inHeading && char === ' ') {
            const heading = document.createElement(`h${headingLevel}`);
            heading.style.fontWeight = 'bold';
            heading.style.margin = '1em 0';
            currentContainer.appendChild(heading);
            currentHeadingElement = heading;
            inHeading = false;
            i++;
            continue;
        }
        // If we're counting heading level but see something else, it's not a heading
        if (inHeading && char !== '#') {
            // Not a real heading, output the # characters we collected
            const text = '#'.repeat(headingLevel) + char;
            const span = document.createElement('span');
            span.innerText = text;
            currentContainer.appendChild(span);
            inHeading = false;
            headingLevel = 0;
            i++;
            continue;
        }
        // Reset heading state at newline
        if (char === '\n') {
            inHeading = false;
            headingLevel = 0;
            currentHeadingElement = null;
        }
        // Add content to heading or normal text
        if (currentHeadingElement) {
            currentHeadingElement.innerText += char;
        }
        else {
            const span = document.createElement('span');
            span.innerText = char;
            currentContainer.appendChild(span);
        }
        i++;
    }
}
