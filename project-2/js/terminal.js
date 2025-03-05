let ui, parser, state;

function toggleTerminal() {
    const chatbox = document.getElementById('terminal-chatbox');
    const btn = document.querySelector('.toggle-terminal-btn');
    chatbox.style.display = chatbox.style.display === 'flex' ? 'none' : 'flex';
    btn.textContent = chatbox.style.display === 'flex' ? 'Close Terminal' : 'Open Terminal';
}

function popoutTerminal() {
    const win = window.open('', 'Terminal', 'width=400,height=500');
    win.document.write(`
        <html>
        <head>
            <title>Hunter's Terminal</title>
            <style>
                body { background: #0d1117; color: #00ff99; font-family: 'IBM Plex Mono', monospace; padding: 10px; }
                #output { height: 400px; overflow-y: auto; }
                input { background: none; border: none; color: #00ff99; width: 100%; font-family: inherit; }
            </style>
        </head>
        <body>
            <div id="output">${document.getElementById('terminal-output').innerHTML}</div>
            <span>${state.currentDir} >_</span><input id="input" autofocus>
        </body>
        </html>
    `);
    win.document.close();
    win.document.getElementById('input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const result = parser.execute(this.value, state);
            win.document.getElementById('output').innerHTML += `> ${this.value}<br>${result}<br>`;
            this.value = '';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const output = document.getElementById('terminal-output');
    const input = document.getElementById('command-input');
    if (!output || !input) return;

    const pageToDir = {
        'index.html': '/home',
        'projects.html': '/home/projects',
        'about.html': '/home/about',
        'contact.html': '/home/contact'
    };
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    state = {
        currentDir: pageToDir[currentPage] || '/home',
        commandHistory: []
    };

    ui = new TerminalUI(output, input, state.currentDir);
    parser = new CommandParser(new FileSystem(), ui);

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const value = this.value.trim();
            if (!value) return;
            ui.print(`> ${value}`);
            state.commandHistory.push(value);
            const result = parser.execute(value, state);
            if (result) ui.print(result);
            this.value = '';
        }
    });

    interact('.terminal-chatbox').draggable({
        inertia: true,
        modifiers: [
            interact.modifiers.restrictRect({ restriction: 'parent', endOnly: true })
        ],
        listeners: {
            move: function(event) {
                const target = event.target;
                const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                target.style.transform = `translate(${x}px, ${y}px)`;
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            }
        }
    }).resizable({
        edges: { top: true, left: true, bottom: true, right: true },
        listeners: {
            move: function(event) {
                const target = event.target;
                let x = (parseFloat(target.getAttribute('data-x')) || 0);
                let y = (parseFloat(target.getAttribute('data-y')) || 0);
                target.style.width = `${event.rect.width}px`;
                target.style.height = `${event.rect.height}px`;
                x += event.deltaRect.left;
                y += event.deltaRect.top;
                target.style.transform = `translate(${x}px, ${y}px)`;
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            }
        },
        modifiers: [
            interact.modifiers.restrictSize({ min: { width: 300, height: 300 } })
        ]
    });
});