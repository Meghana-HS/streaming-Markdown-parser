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
// ----------------------------------------------------
// GLOBAL STATE
// ----------------------------------------------------
let currentContainer = null;
let inInlineCode = false;
let inCodeBlock = false;
let pendingBackticks = 0;
let currentInlineCode = null;
let currentCodeBlock = null;
let textTarget = null;
// ----------------------------------------------------
// DO NOT EDIT runStream
// ----------------------------------------------------
function runStream() {
    currentContainer = document.getElementById("markdownContainer");
    textTarget = currentContainer;
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
// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------
function ensureTextTarget() {
    if (!currentContainer)
        return;
    if (!textTarget)
        textTarget = currentContainer;
}
function appendChar(ch) {
    if (!currentContainer)
        return;
    if (inCodeBlock && currentCodeBlock) {
        currentCodeBlock.appendChild(document.createTextNode(ch));
    }
    else if (inInlineCode && currentInlineCode) {
        currentInlineCode.appendChild(document.createTextNode(ch));
    }
    else {
        ensureTextTarget();
        textTarget.appendChild(document.createTextNode(ch));
    }
}
function handleBackticks(count) {
    if (!currentContainer)
        return;
    // Code block: ``` or more
    if (count >= 3) {
        if (inCodeBlock) {
            inCodeBlock = false;
            currentCodeBlock = null;
            return;
        }
        else {
            inCodeBlock = true;
            const pre = document.createElement("pre");
            const code = document.createElement("code");
            pre.appendChild(code);
            currentContainer.appendChild(pre);
            currentCodeBlock = code;
            return;
        }
    }
    // Inline code: `...`
    if (count === 1 && !inCodeBlock) {
        if (inInlineCode) {
            inInlineCode = false;
            currentInlineCode = null;
        }
        else {
            inInlineCode = true;
            const code = document.createElement("code");
            ensureTextTarget();
            textTarget.appendChild(code);
            currentInlineCode = code;
        }
        return;
    }
    // Fallback: just output literal backticks
    for (let i = 0; i < count; i++) {
        appendChar("`");
    }
}
// ----------------------------------------------------
// MAIN ENTRY: addToken
// ----------------------------------------------------
function addToken(token) {
    if (!currentContainer)
        return;
    for (let i = 0; i < token.length; i++) {
        const ch = token[i];
        if (ch === "`") {
            pendingBackticks++;
            continue;
        }
        if (pendingBackticks > 0) {
            handleBackticks(pendingBackticks);
            pendingBackticks = 0;
        }
        appendChar(ch);
    }
    if (pendingBackticks > 0) {
        handleBackticks(pendingBackticks);
        pendingBackticks = 0;
    }
}
// @ts-ignore
;
window.runStream = runStream;
//# sourceMappingURL=MarkdownParser.js.map