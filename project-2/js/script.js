// Initialize AOS with error handling
try {
    AOS.init({
        duration: 800,
        once: true
    });
    console.log('AOS initialized successfully');
} catch (error) {
    console.error('AOS initialization failed:', error);
}

// Load terminal state from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    const chatbox = document.getElementById('terminal-chatbox');
    const toggleBtn = document.querySelector('.toggle-terminal-btn');
    if (!chatbox || !toggleBtn) {
        console.error('Terminal elements not found');
        return;
    }

    // Restore terminal state
    const terminalState = JSON.parse(localStorage.getItem('terminalStateUI')) || {};
    if (terminalState) {
        // Restore visibility
        if (terminalState.display) {
            chatbox.style.display = terminalState.display;
            toggleBtn.innerHTML = terminalState.display === 'flex' 
                ? '<i class="fas fa-times"></i> Close Terminal' 
                : '<i class="fas fa-terminal"></i> Open Terminal';
        }

        // Restore position
        if (terminalState.x && terminalState.y) {
            chatbox.setAttribute('data-x', terminalState.x);
            chatbox.setAttribute('data-y', terminalState.y);
            chatbox.style.transform = `translate(${terminalState.x}px, ${terminalState.y}px)`;
        }

        // Restore size
        if (terminalState.width && terminalState.height) {
            chatbox.style.width = terminalState.width;
            chatbox.style.height = terminalState.height;
        }
    }

});

// Initialize Interact.js for drag and resize
try {
    interact('.terminal-chatbox')
        .draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ],
            listeners: {
                move(event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);

                    // Save position to localStorage
                    const terminalState = JSON.parse(localStorage.getItem('terminalStateUI')) || {};
                    terminalState.x = x;
                    terminalState.y = y;
                    localStorage.setItem('terminalStateUI', JSON.stringify(terminalState));
                }
            }
        })
        .resizable({
            edges: { top: true, left: true, bottom: false, right: false },
            listeners: {
                move(event) {
                    const target = event.target;
                    let x = parseFloat(target.getAttribute('data-x')) || 0;
                    let y = parseFloat(target.getAttribute('data-y')) || 0;

                    let newWidth = event.rect.width;
                    let newHeight = event.rect.height;

                    newWidth = Math.max(300, Math.min(600, newWidth));
                    newHeight = Math.max(300, Math.min(600, newHeight));

                    target.style.width = `${newWidth}px`;
                    target.style.height = `${newHeight}px`;

                    x += event.deltaRect.left;
                    y += event.deltaRect.top;

                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);

                    // Save size and position to localStorage
                    const terminalState = JSON.parse(localStorage.getItem('terminalStateUI')) || {};
                    terminalState.width = `${newWidth}px`;
                    terminalState.height = `${newHeight}px`;
                    terminalState.x = x;
                    terminalState.y = y;
                    localStorage.setItem('terminalStateUI', JSON.stringify(terminalState));
                }
            },
            modifiers: [
                interact.modifiers.restrictSize({
                    min: { width: 300, height: 300 },
                    max: { width: 600, height: 600 }
                })
            ],
            inertia: true
        });
    console.log('Interact.js initialized successfully');
} catch (error) {
    console.error('Interact.js initialization failed:', error);
}

function toggleTerminal() {
    try {
        const chatbox = document.getElementById('terminal-chatbox');
        const toggleBtn = document.querySelector('.toggle-terminal-btn');
        if (chatbox.style.display === 'flex') {
            chatbox.style.display = 'none';
            toggleBtn.innerHTML = '<i class="fas fa-terminal"></i> Open Terminal';
        } else {
            chatbox.style.display = 'flex';
            toggleBtn.innerHTML = '<i class="fas fa-times"></i> Close Terminal';
            document.getElementById('command-input').focus();
        }

        // Save visibility state to localStorage
        const terminalState = JSON.parse(localStorage.getItem('terminalStateUI')) || {};
        terminalState.display = chatbox.style.display;
        localStorage.setItem('terminalStateUI', JSON.stringify(terminalState));
    } catch (error) {
        console.error('Toggle terminal failed:', error);
    }
}

// Popout terminal into a new window
function popoutTerminal() {
    try {
        const savedState = localStorage.getItem('terminalState');
        const state = savedState ? JSON.parse(savedState) : {
            commandHistory: [],
            historyIndex: -1,
            currentDir: '/home',
            searchHistoryQuery: '',
            searchHistoryIndex: -1
        };

        const popoutWindow = window.open('', 'TerminalPopout', 'width=400,height=500');
        if (!popoutWindow) {
            alert('Popout blocked. Please allow popups for this site.');
            return;
        }

        popoutWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Hunter's Terminal</title>
                <link rel="stylesheet" href="css/styles.css">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        background: #000;
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                    }
                    .terminal-chatbox {
                        position: static;
                        width: 100%;
                        height: 100%;
                        border: none;
                        display: flex;
                        background: rgba(255, 255, 255, 0.05);
                        backdrop-filter: blur(15px);
                    }
                    .resize-handle {
                        display: none;
                    }
                </style>
            </head>
            <body>
                <div class="terminal-chatbox" id="terminal-chatbox">
                    <div class="terminal-header">
                        <span>Hunter's Terminal</span>
                        <div>
                            <button class="close-btn" onclick="window.close()"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <div id="terminal-output"></div>
                    <div class="terminal-input">
                        <span>${state.currentDir} >_</span>
                        <input type="text" id="command-input" placeholder="Type a command...">
                    </div>
                </div>
                <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
                <script src="js/terminal.js"></script>
            </body>
            </html>
        `);
        popoutWindow.document.close();

        popoutWindow.addEventListener('beforeunload', () => {
            const popoutState = popoutWindow.localStorage.getItem('terminalState');
            if (popoutState) {
                localStorage.setItem('terminalState', popoutState);
            }
        });
    } catch (error) {
        console.error('Popout terminal failed:', error);
    }
}