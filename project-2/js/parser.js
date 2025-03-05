function CommandParser(fs, ui) {
    this.fs = fs;
    this.ui = ui;
    this.pageMap = {
        '/home': 'index.html',
        '/home/projects': 'projects.html',
        '/home/about': 'about.html',
        '/home/contact': 'contact.html'
    };

    this.commands = {
        help: {
            exec: (args) => {
                if (!args.length) {
                    return `Available commands:\n${Object.keys(this.commands)
                        .map(cmd => `> ${cmd} - ${this.commands[cmd].desc || 'No description'}`)
                        .join('\n')}`;
                }
                const cmd = this.commands[args[0].toLowerCase()];
                return cmd ? `${cmd.desc || 'No description'}\nUsage: ${cmd.usage || cmd}` : `help: Command "${args[0]}" not found`;
            },
            desc: 'Display available commands or detailed help for a command',
            usage: 'help [command]'
        },
        cd: {
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
                if (page) window.location.href = page;
                return `Changed to ${state.currentDir}`;
            },
            desc: 'Change directory and navigate to the corresponding page',
            usage: 'cd <path>'
        },
        back: {
            exec: (args, state) => {
                const parentPath = this.fs.getParentPath(state.currentDir);
                const result = this.fs.resolvePath(parentPath, state.currentDir);
                if (!result) return 'back: Cannot go to parent directory';
                if (result.node.type !== 'directory') return 'back: Parent is not a directory';
                state.currentDir = result.path;
                this.ui.updatePrompt(state.currentDir);
                const page = this.pageMap[state.currentDir];
                if (page) window.location.href = page;
                return `Changed to ${state.currentDir}`;
            },
            desc: 'Go to the parent directory and corresponding page',
            usage: 'back'
        },
        ls: {
            exec: (args, state) => {
                const result = this.fs.resolvePath(state.currentDir, state.currentDir);
                if (!result || result.node.type !== 'directory') return 'ls: Not a directory';
                const entries = Object.keys(result.node.children);
                return entries.length ? entries.join(' ') : 'Directory is empty';
            },
            desc: 'List all entries in the current directory',
            usage: 'ls'
        },
        pwd: {
            exec: (args, state) => {
                return state.currentDir;
            },
            desc: 'Print working directory',
            usage: 'pwd'
        },
        whoami: {
            exec: () => {
                return 'User: Hunter Todd';
            },
            desc: 'Display user info',
            usage: 'whoami'
        },
        history: {
            exec: (args, state) => {
                return state.commandHistory.length ? state.commandHistory.map((cmd, i) => `${i}: ${cmd}`).join('\n') : 'No history';
            },
            desc: 'Show command history',
            usage: 'history'
        },
        exit: {
            exec: () => {
                window.location.href = 'index.html';
                return 'Exiting...';
            },
            desc: 'Return to hub',
            usage: 'exit'
        },
        cat: {
            exec: (args, state) => {
                if (!args.length) return 'cat: Specify a file (e.g., "cat /home/about.txt")';
                const result = this.fs.resolvePath(args[0], state.currentDir);
                if (!result) return 'cat: File not found';
                if (result.node.type === 'file') {
                    const output = result.node.content;
                    if (args[1] === '>') {
                        const targetPath = args[2];
                        return this.fs.touch(targetPath, state.currentDir, output);
                    }
                    return output;
                }
                if (result.node.type === 'link') return `Link: ${result.node.url}`;
                return 'cat: Not a readable file';
            },
            desc: 'Display file contents',
            usage: 'cat <file>'
        },
        open: {
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
                                    body { background: #0d1117; color: #00ff99; font-family: 'IBM Plex Mono', monospace; padding: 20px; white-space: pre-wrap; }
                                </style>
                            </head>
                            <body>${result.node.content.replace(/\n/g, '<br>')}</body>
                            </html>
                        `);
                        newWindow.document.close();
                        return `Opening ${result.path} in a new tab...`;
                    }
                    return 'open: Unable to open new tab';
                }
                return 'open: Not a project link or text file';
            },
            desc: 'Open a project link or text file in a new tab',
            usage: 'open <path>'
        },
        echo: {
            exec: (args) => {
                return args.length ? args.join(' ') : '';
            },
            desc: 'Print text to the terminal',
            usage: 'echo <text>'
        },
        contact: {
            exec: (args) => {
                if (!args.length) return 'contact: Use "contact send <name> <email> <message>"';
                if (args[0] === 'send') {
                    const [_, name, email, ...message] = args;
                    if (!name || !email || !message.length) return 'contact: Format is "contact send <name> <email> <message>"';
                    if (!/\S+@\S+\.\S+/.test(email)) return 'contact: Invalid email';
                    return `Message sent from ${name} (${email}): ${message.join(' ')}`;
                }
                return 'contact: Unknown subcommand';
            },
            desc: 'Send a message',
            usage: 'contact send <name> <email> <message>'
        },
        mkdir: {
            exec: (args, state) => {
                if (!args.length) return 'mkdir: Specify a directory path (e.g., "mkdir /home/newdir")';
                return this.fs.mkdir(args[0], state.currentDir);
            },
            desc: 'Create a new directory',
            usage: 'mkdir <path>'
        },
        touch: {
            exec: (args, state) => {
                if (!args.length) return 'touch: Specify a file path (e.g., "touch /home/newfile.txt")';
                return this.fs.touch(args[0], state.currentDir);
            },
            desc: 'Create a new file',
            usage: 'touch <path>'
        },
        rm: {
            exec: (args, state) => {
                if (!args.length) return 'rm: Specify a file or directory path (e.g., "rm /home/newfile.txt")';
                return this.fs.rm(args[0], state.currentDir);
            },
            desc: 'Remove a file or directory',
            usage: 'rm <path>'
        },
        tree: {
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
            },
            desc: 'Display directory tree',
            usage: 'tree'
        },
        clear: {
            exec: () => {
                this.ui.clear();
                return '';
            },
            desc: 'Clear the terminal display',
            usage: 'clear'
        }
    };

    this.execute = function(input, state) {
        const parts = input.trim().split(/\s+/);
        if (!parts.length) return '';
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        const command = this.commands[cmd];
        return command ? command.exec(args, state) : `${cmd}: Command not found\nType "help" for commands`;
    };
}