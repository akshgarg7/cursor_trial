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

let currentContainer: HTMLElement | null = null; 
// Do not edit this method
function runStream() {
    currentContainer = document.getElementById('markdownContainer')!;

    // this randomly split the markdown into tokens between 2 and 20 characters long
    // simulates the behavior of an ml model thats giving you weirdly chunked tokens
    const tokens: string[] = [];
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
        } else {
            clearInterval(toCancel);
        }
    }, 100);
}

let inCodeBlock = false;
let inInlineCode = false;
let codeBlockBuffer = "";
let inlineCodeBuffer = "";
let partialBackticks = ""; // To track incomplete backticks
let codeBlockLanguage = ""; // To store code block language if specified
let languageBuffer = ""; // Add this with other state variables at the top

let currentCodeBlockElement: HTMLPreElement | null = null; // Reference to the current <pre> element
let currentInlineCodeElement: HTMLElement | null = null; // Reference to the current <code> element

function addToken(token: string) {
    if (!currentContainer) return;

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
                    // Create a wrapper div for the code block and language label
                    const codeWrapper = document.createElement('div');
                    codeWrapper.style.backgroundColor = '#1e1e1e'; // Dark background
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

                    codeWrapper.appendChild(languageLabel);
                    codeWrapper.appendChild(currentCodeBlockElement);
                    currentContainer.appendChild(codeWrapper);
                    languageBuffer = '';
                } else {
                    // End of code block
                    currentCodeBlockElement = null;
                    codeBlockBuffer = '';
                    codeBlockLanguage = '';
                    languageBuffer = ''; // Reset language buffer
                }
            } else if (partialBackticks === '`') {
                // Handle inline code
                inInlineCode = !inInlineCode;
                partialBackticks = '';

                if (inInlineCode) {
                    // Beginning of inline code
                    currentInlineCodeElement = document.createElement('code');
                    currentInlineCodeElement.style.backgroundColor = '#eef'; // Light blue for visibility
                    currentContainer.appendChild(currentInlineCodeElement);
                } else {
                    // End of inline code
                    currentInlineCodeElement = null;
                    inlineCodeBuffer = '';
                }
            } else {
                // Wait for more backticks if we have less than 3
                i++;
                continue;
            }
            continue;
        }

        // Not dealing with backticks, handle content
        if (inCodeBlock) {
            if (currentCodeBlockElement) {
                if (codeBlockLanguage === '') {
                    // Buffer characters until we hit a newline
                    if (char === '\n') {
                        codeBlockLanguage = languageBuffer.trim();
                        // Update the language label text when we detect the language
                        const wrapper = currentCodeBlockElement.parentElement;
                        if (wrapper) {
                            const label = wrapper.firstChild as HTMLElement;
                            label.textContent = `# ${codeBlockLanguage}`;
                        }
                        languageBuffer = '';
                        i++; // Skip the newline character
                        continue; // Don't add the newline to the content
                    } else {
                        languageBuffer += char;
                        i++;
                        continue;
                    }
                }
                // Append character to the current <pre> element
                currentCodeBlockElement.innerText += char;
            } else {
                // This shouldn't happen, but handle gracefully
                codeBlockBuffer += char;
            }
        } else if (inInlineCode) {
            if (currentInlineCodeElement) {
                // Append character to the current <code> element
                currentInlineCodeElement.innerText += char;
            } else {
                // This shouldn't happen, but handle gracefully
                inlineCodeBuffer += char;
            }
        } else {
            // Regular text
            const span = document.createElement('span');
            span.innerText = char;
            currentContainer.appendChild(span);
        }
        i++;
    }
}