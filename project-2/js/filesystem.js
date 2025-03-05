function FileSystem() {
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
                                'myshell_program': { 
                                    type: 'file',
                                    content: 'MyShell Program\nDeveloped a custom Unix shell in C with built-in commands and network capabilities using socket programming.\nFeatures include process control, piping, and I/O redirection.',
                                    created: new Date('2023-11-01')
                                },
                                'us_map_explorer': { 
                                    type: 'file',
                                    content: 'Exploring the U.S. Map\nCreated an interactive C++ application to navigate a U.S. map using Dijkstra\'s algorithm for shortest path calculations.\nBuilt an in-memory graph structure from dataset files.',
                                    created: new Date('2023-05-01')
                                },
                                'word_search_game': { 
                                    type: 'link',
                                    url: 'https://h-user-t.github.io/front-end-fund/project-1/',
                                    created: new Date()
                                }
                            }
                        },
                        'about': {
                            type: 'directory',
                            created: new Date(),
                            children: {
                                'about.txt': { 
                                    type: 'file',
                                    content: 'Hunter Todd\nSenior at University of Miami\nMajor: Software Engineering (B.S., Expected May 2025)\nGPA: 3.88\nAwards: IEEE-HKN and Tau Beta Pi Member\nLinks: <a href="https://linkedin.com/in/hunter-todd-717793212">LinkedIn</a> <a href="https://github.com/h-user-t">GitHub</a>',
                                    created: new Date()
                                }
                            }
                        },
                        'contact': {
                            type: 'directory',
                            created: new Date(),
                            children: {
                                'contact.txt': { 
                                    type: 'file',
                                    content: 'Email: h.todd20@outlook.com\nLocation: Coral Gables, FL\nSocial: <a href="https://linkedin.com/in/hunter-todd-717793212">LinkedIn</a> | <a href="https://github.com/h-user-t">GitHub</a> | <a href="https://twitter.com/huntertodd">Twitter</a>',
                                    created: new Date()
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    this.resolvePath = function(path, currentDir, createIfNotExists = false) {
        const absolutePath = path === '/' ? '/' : path.startsWith('/') ? path : `${currentDir}/${path}`.replace('//', '/');
        if (absolutePath === '/') return { node: this.root['/'], path: '/' };

        const parts = absolutePath.split('/').filter(p => p); // Remove empty parts
        let node = this.root['/'];
        let pathStack = ['/'];

        for (let part of parts) {
            if (part === '.') continue; // Current directory, skip
            if (part === '..') { // Parent directory
                if (pathStack.length > 1) pathStack.pop();
                node = this.root['/'];
                for (let i = 1; i < pathStack.length; i++) {
                    if (!node.children || !node.children[pathStack[i]]) return null;
                    node = node.children[pathStack[i]];
                }
                continue;
            }
            // Check if the part exists in children
            if (!node.children || !node.children[part]) {
                if (createIfNotExists) {
                    node.children = node.children || {};
                    node.children[part] = { type: 'directory', created: new Date(), children: {} };
                } else {
                    return null;
                }
            }
            node = node.children[part];
            pathStack.push(part);
        }
        return { node, path: pathStack.join('/') };
    };

    this.getParentPath = function(path) {
        const parts = path.split('/').filter(p => p);
        parts.pop();
        return parts.length ? `/${parts.join('/')}` : '/';
    };

    this.mkdir = function(path, currentDir) {
        const result = this.resolvePath(path, currentDir, true);
        if (!result) return 'mkdir: Cannot create directory';
        return `Created directory ${result.path}`;
    };

    this.touch = function(path, currentDir, content = '') {
        const parentPath = this.getParentPath(path);
        const filename = path.split('/').filter(p => p).pop();
        const parent = this.resolvePath(parentPath, currentDir, true);
        if (!parent) return 'touch: Cannot create file - invalid parent directory';
        if (parent.node.children[filename]) return 'touch: File already exists';
        parent.node.children[filename] = { type: 'file', content, created: new Date() };
        return `Created file ${path}`;
    };

    this.rm = function(path, currentDir) {
        const parentPath = this.getParentPath(path);
        const filename = path.split('/').filter(p => p).pop();
        const parent = this.resolvePath(parentPath, currentDir);
        if (!parent) return 'rm: Parent directory not found';
        if (!parent.node.children[filename]) return 'rm: File or directory not found';
        delete parent.node.children[filename];
        return `Removed ${path}`;
    };
}