// Log to confirm script is loading
console.log('terminal.js loaded');

// FileSystem class to manage the filesystem
class FileSystem {
    constructor() {
        this.root = {
            '/': {
                type: 'directory',
                created: new Date(),
                children: {
                    'home': {
                        type: 'directory',
                        created: new Date(),
                        children: {
                            'projects': {
                                type: 'directory',
                                created: new Date(),
                                children: {
                                    'project_1': { 
                                        type: 'link', 
                                        url: 'https://h-user-t.github.io/front-end-fund/project-1/',
                                        created: new Date()
                                    },
                                    'project_2': { 
                                        type: 'link', 
                                        url: '#',
                                        created: new Date()
                                    },
                                    'word_search_game': { 
                                        type: 'link', 
                                        url: 'https://h-user-t.github.io/front-end-fund/project-1/',
                                        created: new Date()
                                    },
                                    'myshell_program': { 
                                        type: 'file',
                                        content: 'MyShell Program\nDeveloped a custom Unix shell in C with built-in commands and network capabilities using socket programming.\nFeatures include process control, piping, and I/O redirection.',
                                        created: new Date('2023-11-01')
                                    },
                                    'us_map_explorer': { 
                                        type: 'file',
                                        content: 'Exploring the U.S. Map\nCreated an interactive C++ application to navigate a U.S. map using Dijkstra\'s algorithm for shortest path calculations.\nBuilt an in-memory graph structure from dataset files.',
                                        created: new Date('2023-05-01')
                                    }
                                }
                            },
                            'about': {
                                type: 'directory',
                                created: new Date(),
                                children: {}
                            },
                            'contact': {
                                type: 'directory',
                                created: new Date(),
                                children: {}
                            },
                            'about.txt': { 
                                type: 'file',
                                content: 'Hunter Todd\nSenior at University of Miami\nMajor: Software Engineering (B.S., Expected May 2025)\nGPA: 3.88\nAwards: IEEE-HKN and Tau Beta Pi Member, President\'s Honor Roll (3x), Provost Honor Roll (2x), Dean\'s List (1x)\nLinks: <a href="https://twitter.com/huntertodd">Twitter</a> <a href="https://linkedin.com/in/hunter-todd-717793212">LinkedIn</a> <a href="https://github.com/h-user-t">GitHub</a>',
                                created: new Date()
                            },
                            'skills.txt': { 
                                type: 'file',
                                content: 'Programming Languages: C/C++, Python, Java, JavaScript/TypeScript, HTML/CSS, BCPL, LaTeX\nFrameworks: React, Angular, Node.js, Flask\nTools and Technologies: Git/GitHub, Unix Shell, VS Code, IntelliJ IDEA, CLion, PyCharm, MySQL, Docker, Kubernetes, Jira, Bitbucket',
                                created: new Date()
                            },
                            'contact.txt': { 
                                type: 'file',
                                content: 'Email: h.todd20@outlook.com\nLocation: Coral Gables, FL\nPhone: (123) 456-7890\nSocial: <a href="https://twitter.com/huntertodd">Twitter</a> | <a href="https://linkedin.com/in/hunter-todd-717793212">LinkedIn</a> | <a href="https://github.com/h-user-t">GitHub</a>\nUse "contact send <name> <email> <message>" to send a message',
                                created: new Date()
                            }
                        }
                    },
                    'bin': {
                        type: 'directory',
                        created: new Date(),
                        children: {
                            'hack': { 
                                type: 'executable',
                                execute: () => {
                                    let hackText = 'Initializing hack sequence...\n';
                                    for (let i = 0; i < 5; i++) {
                                        hackText += `Attempt ${i + 1}: ${Math.random().toString(36).substring(2, 15)}\n`;
                                    }
                                    hackText += 'Access granted!';
                                    return hackText;
                                },
                                created: new Date()
                            },
                            'analyze': { 
                                type: 'executable',
                                execute: (args) => {
                                    if (!args.length) return 'analyze: Provide text to analyze';
                                    const words = args.join(' ').split(/\s+/).filter(w => w);
                                    const wordCount = {};
                                    words.forEach(w => wordCount[w] = (wordCount[w] || 0) + 1);
                                    return `Word count:\n${Object.entries(wordCount).map(([w, c]) => `${w}: ${c}`).join('\n')}`;
                                },
                                created: new Date()
                            },
                            'date': { 
                                type: 'executable',
                                execute: () => `Current date: ${new Date().toLocaleDateString()}`,
                                created: new Date()
                            }
                        }
                    }
                }
            }
        };
    }

    resolvePath(path, currentDir, createIfNotExists = false) {
        const absolutePath = path === '/' ? '/' : path.startsWith('/') ? path : `${currentDir}/${path}`.replace('//', '/');
        if (absolutePath === '/') {
            return { node: this.root['/'], path: '/' };
        }

        const parts = absolutePath.split('/').filter(p => p);
        let node = this.root['/'];
        let pathStack = ['/'];

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part === '.') {
                continue;
            }

            if (part === '..') {
                if (pathStack.length > 1) {
                    pathStack.pop();
                }
                node = this.root['/'];
                for (let j = 1; j < pathStack.length; j++) {
                    if (!node || node.type !== 'directory' || !node.children[pathStack[j]]) {
                        return null;
                    }
                    node = node.children[pathStack[j]];
                }
                continue;
            }

            if (!node || node.type !== 'directory') {
                return null;
            }

            if (!node.children[part]) {
                if (createIfNotExists) {
                    node.children[part] = { type: 'directory', created: new Date(), children: {} };
                } else {
                    return null;
                }
            }

            node = node.children[part];
            pathStack.push(part);
        }

        const resolvedPath = pathStack.length === 1 ? '/' : `/${pathStack.slice(1).join('/')}`;
        return { node, path: resolvedPath };
    }

    getParentPath(path) {
        const parts = path.split('/').filter(p => p);
        parts.pop();
        return parts.length ? `/${parts.join('/')}` : '/';
    }

    mkdir(path, currentDir) {
        const result = this.resolvePath(path, currentDir, true);
        if (!result) return 'mkdir: Cannot create directory';
        return `Created directory ${result.path}`;
    }

    touch(path, currentDir, content = '') {
        const parentPath = this.getParentPath(path);
        const filename = path.split('/').filter(p => p).pop();
        const parent = this.resolvePath(parentPath, currentDir, true);
        if (!parent) return 'touch: Cannot create file - invalid parent directory';
        if (parent.node.children[filename]) return 'touch: File already exists';
        parent.node.children[filename] = { type: 'file', content, created: new Date() };
        return `Created file ${path}`;
    }

    rm(path, currentDir) {
        const parentPath = this.getParentPath(path);
        const filename = path.split('/').filter(p => p).pop();
        const parent = this.resolvePath(parentPath, currentDir);
        if (!parent) return 'rm: Parent directory not found';
        if (!parent.node.children[filename]) return 'rm: File or directory not found';
        delete parent.node.children[filename];
        return `Removed ${path}`;
    }
}

// CommandParser class to handle command parsing and execution
class CommandParser {
    constructor(fs, ui) {
        this.fs = fs;
        this.ui = ui;
        this.aliases = { 'dir': 'ls' };
        this.pageMap = {
            '/home': 'index.html',
            '/home/projects': 'projects.html',
            '/home/about': 'about.html',
            '/home/contact': 'contact.html',
            '/home/terminal': 'terminal.html'
        };
        this.commands = {
            help: {
                desc: 'Display available commands or detailed help for a command',
                usage: 'help [command]',
                exec: (args) => {
                    if (!args.length) {
                        return `Available commands:\n${Object.keys(this.commands)
                            .map(cmd => `> ${cmd} - ${this.commands[cmd].desc}`)
                            .join('\n')}`;
                    }
                    const cmd = this.resolveCommand(args[0]);
                    if (!cmd) return `help: Command "${args[0]}" not found`;
                    return `${cmd.desc}\nUsage: ${cmd.usage}`;
                }
            },
            cd: {
                desc: 'Change directory and navigate to the corresponding page',
                usage: 'cd <path>',
                exec: (args, state) => {
                    if (!args.length) return `Current directory: ${state.currentDir}`;
                    let path = args[0];
                    if (path === 'home') path = '/home';
                    const result = this.fs.resolvePath(path, state.currentDir);
                    if (!result) return 'cd: No such directory or page';
                    if (result.node.type !== 'directory') return 'cd: Not a directory';
                    state.currentDir = result.path;
                    this.ui.updatePrompt(state.currentDir);
                    const page = this.pageMap[state.currentDir];
                    if (page) {
                        window.location.href = page;
                        return `Changed to ${state.currentDir}\nNavigated to ${page.replace('.html', '').replace('index', 'Home')} page`;
                    }
                    return `Changed to ${state.currentDir}`;
                }
            },
            back: {
                desc: 'Go to the parent directory and corresponding page',
                usage: 'back',
                exec: (args, state) => {
                    const parentPath = this.fs.getParentPath(state.currentDir);
                    const result = this.fs.resolvePath(parentPath, state.currentDir);
                    if (!result) return 'back: Cannot go to parent directory';
                    if (result.node.type !== 'directory') return 'back: Parent is not a directory';
                    state.currentDir = result.path;
                    this.ui.updatePrompt(state.currentDir);
                    const page = this.pageMap[state.currentDir];
                    if (page) {
                        window.location.href = page;
                        return `Changed to ${state.currentDir}\nNavigated to ${page.replace('.html', '').replace('index', 'Home')} page`;
                    }
                    return `Changed to ${state.currentDir}`;
                }
            },
            ls: {
                desc: 'List all entries in the current directory',
                usage: 'ls',
                exec: (args, state) => {
                    const result = this.fs.resolvePath(state.currentDir, state.currentDir);
                    if (!result || result.node.type !== 'directory') return 'ls: Not a directory';
                    const entries = Object.keys(result.node.children);
                    const clickableEntries = entries.map(entry => {
                        const fullPath = state.currentDir === '/' ? `/${entry}` : `${state.currentDir}/${entry}`;
                        const node = result.node.children[entry];
                        const isDirectory = node.type === 'directory';
                        const onclickAction = isDirectory 
                            ? `executeCdCommand('${fullPath}')`
                            : `executeOpenCommand('${fullPath}')`;
                        const tooltip = `Type: ${node.type}, Created: ${node.created.toLocaleString()}`;
                        return `<span style="cursor: pointer; text-decoration: underline;" title="${tooltip}" onclick="${onclickAction}">${entry}</span>`;
                    });
                    return clickableEntries.join(' ') || 'Directory is empty';
                }
            },
            pwd: {
                desc: 'Print working directory',
                usage: 'pwd',
                exec: (args, state) => state.currentDir
            },
            whoami: {
                desc: 'Display user info',
                usage: 'whoami',
                exec: () => 'User: Hunter Todd'
            },
            history: {
                desc: 'Show command history',
                usage: 'history',
                exec: (args, state) => state.commandHistory.length ? state.commandHistory.map((cmd, i) => `${i}: ${cmd}`).join('\n') : 'No history'
            },
            exit: {
                desc: 'Return to hub',
                usage: 'exit',
                exec: () => {
                    window.location.href = 'index.html';
                    return 'Exiting...';
                }
            },
            cat: {
                desc: 'Display file contents',
                usage: 'cat <file>',
                exec: (args, state) => {
                    if (!args.length) return 'cat: Specify a file (e.g., "cat /home/about.txt")';
                    const result = this.fs.resolvePath(args[0], state.currentDir);
                    if (!result) return 'cat: File not found';
                    if (result.node.type === 'file') {
                        const output = result.node.content;
                        if (args[1] === '>') {
                            const targetPath = args[2];
                            const parentPath = this.fs.getParentPath(targetPath);
                            const filename = targetPath.split('/').filter(p => p).pop();
                            const parent = this.fs.resolvePath(parentPath, state.currentDir, true);
                            if (!parent) return 'cat: Cannot create output file - invalid parent directory';
                            parent.node.children[filename] = { type: 'file', content: output, created: new Date() };
                            return `Output written to ${targetPath}`;
                        }
                        return output;
                    }
                    if (result.node.type === 'link') return `Link: ${result.node.url}`;
                    return 'cat: Not a readable file';
                }
            },
            open: {
                desc: 'Open a project link or text file in a new tab',
                usage: 'open <path>',
                exec: (args, state) => {
                    if (!args.length) return 'open: Specify a project or file (e.g., "open /home/about.txt")';
                    const result = this.fs.resolvePath(args[0], state.currentDir);
                    if (!result) return 'open: File not found';
                    if (result.node.type === 'link') {
                        window.open(result.node.url, '_blank');
                        return `Opening ${result.path.split('/').pop()} in a new tab...`;
                    }
                    if (result.node.type === 'file') {
                        const newWindow = window.open('', '_blank');
                        if (newWindow) {
                            newWindow.document.write(`
                                <!DOCTYPE html>
                                <html>
                                <head>
                                    <title>${result.path}</title>
                                    <style>
                                        body {
                                            background: #000;
                                            color: #fff;
                                            font-family: 'IBM Plex Mono', monospace;
                                            padding: 20px;
                                            white-space: pre-wrap;
                                        }
                                    </style>
                                </head>
                                <body>
                                    ${result.node.content.replace(/\n/g, '<br>')}
                                </body>
                                </html>
                            `);
                            newWindow.document.close();
                            return `Opening ${result.path} in a new tab...`;
                        }
                        return 'open: Unable to open new tab';
                    }
                    return 'open: Not a project link or text file';
                }
            },
            echo: {
                desc: 'Print text to the terminal',
                usage: 'echo <text>',
                exec: (args) => args.length ? args.join(' ') : ''
            },
            contact: {
                desc: 'Send a message',
                usage: 'contact send <name> <email> <message>',
                exec: (args) => {
                    if (!args.length) return 'contact: Use "contact send <name> <email> <message>"';
                    if (args[0] === 'send') {
                        const [_, name, email, ...message] = args;
                        if (!name || !email || !message.length) return 'contact: Format is "contact send <name> <email> <message>"';
                        if (!/\S+@\S+\.\S+/.test(email)) return 'contact: Invalid email';
                        return `Message sent from ${name} (${email}): ${message.join(' ')}`;
                    }
                    return 'contact: Unknown subcommand';
                }
            },
            mkdir: {
                desc: 'Create a new directory',
                usage: 'mkdir <path>',
                exec: (args, state) => {
                    if (!args.length) return 'mkdir: Specify a directory path (e.g., "mkdir /home/newdir")';
                    return this.fs.mkdir(args[0], state.currentDir);
                }
            },
            touch: {
                desc: 'Create a new file',
                usage: 'touch <path>',
                exec: (args, state) => {
                    if (!args.length) return 'touch: Specify a file path (e.g., "touch /home/newfile.txt")';
                    return this.fs.touch(args[0], state.currentDir);
                }
            },
            rm: {
                desc: 'Remove a file or directory',
                usage: 'rm <path>',
                exec: (args, state) => {
                    if (!args.length) return 'rm: Specify a file or directory path (e.g., "rm /home/newfile.txt")';
                    return this.fs.rm(args[0], state.currentDir);
                }
            },
            tree: {
                desc: 'Display directory tree',
                usage: 'tree',
                exec: (args, state) => {
                    function buildTree(node, prefix = '') {
                        let output = '';
                        const entries = Object.keys(node.children);
                        entries.forEach((entry, i) => {
                            const isLast = i === entries.length - 1;
                            const child = node.children[entry];
                            const symbol = child.type === 'directory' ? 'd' : child.type === 'link' ? 'l' : 'f';
                            output += `${prefix}${isLast ? '└──' : '├──'} ${entry} (${symbol})\n`;
                            if (child.type === 'directory') {
                                output += buildTree(child, prefix + (isLast ? '    ' : '│   '));
                            }
                        });
                        return output;
                    }
                    const result = this.fs.resolvePath(state.currentDir, state.currentDir);
                    if (!result) return 'tree: Cannot resolve current directory';
                    return buildTree(result.node) || 'No subdirectories';
                }
            },
            clear: {
                desc: 'Clear the terminal display',
                usage: 'clear',
                exec: () => {
                    this.ui.clear();
                    return '';
                }
            }
        };
    }

    resolveCommand(cmd) {
        cmd = cmd.toLowerCase();
        if (this.aliases[cmd]) cmd = this.aliases[cmd];
        const matches = Object.keys(this.commands).filter(c => c.startsWith(cmd));
        return matches.length === 1 ? this.commands[matches[0]] : matches.length > 1 ? null : this.commands[cmd];
    }

    execute(input, state) {
        const parts = input.trim().split(/\s+/);
        if (!parts.length) return '';
        const cmdName = parts[0].toLowerCase();
        const args = parts.slice(1);
        const command = this.resolveCommand(cmdName);
        if (!command) return `${cmdName}: Command not found\nType "help" for commands`;
        return command.exec(args, state);
    }
}

// TerminalUI class to handle UI interactions
class TerminalUI {
    constructor(output, input, currentDir) {
        this.output = output;
        this.input = input;
        this.currentDir = currentDir;
        this.promptElement = $('.terminal-input span');
        this.updatePrompt(currentDir);

        // Load terminal output history from localStorage
        const savedOutput = localStorage.getItem('terminalOutputHistory');
        if (savedOutput) {
            $(this.output).html(savedOutput);
            this.output.scrollTop = this.output.scrollHeight;
        } else {
            this.print('Welcome to Hunter Todd\'s Terminal\nType "help" for commands');
        }
    }

    updatePrompt(currentDir) {
        this.currentDir = currentDir;
        this.promptElement.html(`${this.currentDir} >_`);
    }

    print(text) {
        const div = $('<div></div>').html(text.replace(/\n/g, '<br>'));
        $(this.output).append(div);
        this.output.scrollTop = this.output.scrollHeight;

        // Save output history to localStorage
        localStorage.setItem('terminalOutputHistory', $(this.output).html());
    }

    clear() {
        $(this.output).html('');
        localStorage.removeItem('terminalOutputHistory');
    }
}

// Wrap everything in DOMContentLoaded
$(document).ready(() => {
    console.log('DOMContentLoaded fired');

    // DOM elements
    const output = document.getElementById('terminal-output');
    const input = document.getElementById('command-input');

    // Validate DOM elements
    if (!output || !input) {
        console.error('DOM elements not found: output=', output, 'input=', input);
        throw new Error('Required DOM elements not found');
    }

    // Map pages to directories
    const pageToDirMap = {
        'index.html': '/home',
        'projects.html': '/home/projects',
        'about.html': '/home/about',
        'contact.html': '/home/contact',
        'terminal.html': '/home/terminal'
    };

    // Determine initial directory based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const initialDir = pageToDirMap[currentPage] || '/home';

    // Load state from localStorage
    const savedState = localStorage.getItem('terminalState');
    let state;
    if (savedState) {
        state = JSON.parse(savedState);
        state.currentDir = initialDir; // Override currentDir based on page
    } else {
        state = {
            commandHistory: [],
            historyIndex: -1,
            currentDir: initialDir,
            searchHistoryQuery: '',
            searchHistoryIndex: -1
        };
    }

    // Initialize components
    const ui = new TerminalUI(output, input, state.currentDir);
    const parser = new CommandParser(new FileSystem(), ui);

    // Global functions for clickable entries
    window.executeOpenCommand = (path) => {
        const result = parser.commands.open.exec([path], state);
        if (result) ui.print(result);
        saveState();
    };

    window.executeCdCommand = (path) => {
        const result = parser.commands.cd.exec([path], state);
        if (result) ui.print(result);
        saveState();
    };

    // Save state to localStorage
    function saveState() {
        localStorage.setItem('terminalState', JSON.stringify(state));
    }

    // Clear initial loading message and show welcome message (only if no history)
    if (!localStorage.getItem('terminalOutputHistory')) {
        ui.output.innerHTML = '';
        ui.print('Welcome to Hunter Todd\'s Terminal\nType "help" for commands');
    }

    // Input handling
    $(input).on('keydown', (e) => {
        if (e.key === 'Enter') {
            const value = $(input).val().trim();
            if (!value) return;
            ui.print(`> ${value}`);
            state.commandHistory.unshift(value);
            state.historyIndex = -1;
            state.searchHistoryQuery = '';
            state.searchHistoryIndex = -1;

            const result = parser.execute(value, state);
            if (result) ui.print(result);
            $(input).val('');
            saveState();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const value = $(input).val();
            const parts = value.trim().split(/\s+/);
            const lastPart = parts.pop();
            const prefix = parts.join(' ');
            const matches = Object.keys(parser.commands).filter(cmd => cmd.startsWith(lastPart));
            if (matches.length === 1) {
                $(input).val(prefix ? `${prefix} ${matches[0]}` : matches[0]);
            } else if (matches.length > 1) {
                ui.print(`Possible completions: ${matches.join(' ')}`);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (state.searchHistoryQuery) {
                const matches = state.commandHistory.filter(cmd => cmd.includes(state.searchHistoryQuery));
                if (state.searchHistoryIndex < matches.length - 1) {
                    state.searchHistoryIndex++;
                    $(input).val(matches[state.searchHistoryIndex]);
                }
            } else if (state.historyIndex < state.commandHistory.length - 1) {
                state.historyIndex++;
                $(input).val(state.commandHistory[state.historyIndex]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (state.searchHistoryQuery) {
                const matches = state.commandHistory.filter(cmd => cmd.includes(state.searchHistoryQuery));
                if (state.searchHistoryIndex > 0) {
                    state.searchHistoryIndex--;
                    $(input).val(matches[state.searchHistoryIndex]);
                } else {
                    state.searchHistoryIndex = -1;
                    $(input).val(state.searchHistoryQuery);
                }
            } else if (state.historyIndex > -1) {
                state.historyIndex--;
                $(input).val(state.historyIndex === -1 ? '' : state.commandHistory[state.historyIndex]);
            }
        } else if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            state.searchHistoryQuery = $(input).val();
            state.searchHistoryIndex = -1;
            const matches = state.commandHistory.filter(cmd => cmd.includes(state.searchHistoryQuery));
            if (matches.length) {
                state.searchHistoryIndex = 0;
                $(input).val(matches[0]);
            }
        } else if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            $(input).val('');
            ui.print('^C');
        }
    });

    // Update terminal state when navigating via links (only in main window)
    if ($('.app-bar').length) {
        $('.app-bar a').on('click', (e) => {
            const href = $(e.currentTarget).attr('href');
            const page = href.split('/').pop();
            const dir = Object.keys(parser.pageMap).find(key => parser.pageMap[key] === page);
            if (dir) {
                state.currentDir = dir;
                saveState();
            }
        });
    }
});