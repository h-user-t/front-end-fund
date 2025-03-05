document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const input = document.getElementById('command-input');

    let gameState = {
        grid: [],
        words: [],
        found: [],
        gridSize: 0
    };

    const commands = {
        help: () => `
            Commands:
            > help - Show_this_menu
            > start_[size] - Start_game_(e.g.,_start_15)_[15-30]
            > grid - Display_current_grid
            > words - List_words_to_find
            > find_[row]_[col]_[direction]_[length] - Find_word_(e.g.,_find_0_0_right_5)
            > exit - Return_to_main_terminal
        `,
        start: (args) => {
            const size = parseInt(args);
            if (isNaN(size) || size < 15 || size > 30) return 'Error:_Size_must_be_15-30';
            gameState.gridSize = size;
            gameState.grid = Array(size).fill().map(() => Array(size).fill(null));
            gameState.words = ['APPLE', 'BANANA', 'CHERRY', 'GRAPE', 'LEMON'].map(w => ({ word: w, found: false, pos: null }));
            gameState.found = [];
            placeWords();
            fillGrid();
            return `Game_started_with_${size}x${size}_grid\nType_"grid"_to_see_it`;
        },
        grid: () => {
            if (!gameState.gridSize) return 'Error:_Start_a_game_first';
            let gridStr = 'Current_grid:\n';
            gridStr += '  ' + Array.from({ length: gameState.gridSize }, (_, i) => String(i).padStart(2, ' ')).join(' ') + '\n';
            gameState.grid.forEach((row, i) => {
                gridStr += `${String(i).padStart(2, ' ')} ${row.map(c => c || '.').join(' ')}\n`;
            });
            return gridStr;
        },
        words: () => {
            if (!gameState.gridSize) return 'Error:_Start_a_game_first';
            return `Words_to_find:\n${gameState.words.map(w => `${w.word}${w.found ? '_[FOUND]' : ''}`).join('\n')}`;
        },
        find: (args) => {
            if (!gameState.gridSize) return 'Error:_Start_a_game_first';
            const [row, col, dir, len] = args.split('_');
            const r = parseInt(row), c = parseInt(col), length = parseInt(len);
            if (isNaN(r) || isNaN(c) || isNaN(length) || r < 0 || c < 0 || length <= 0) {
                return 'Error:_Invalid_format_(find_row_col_direction_length)';
            }
            const directions = {
                right: [0, 1], left: [0, -1], down: [1, 0], up: [-1, 0],
                downright: [1, 1], downleft: [1, -1], upright: [-1, 1], upleft: [-1, -1]
            };
            if (!directions[dir]) return 'Error:_Invalid_direction_(right/left/up/down/downright/downleft/upright/upleft)';
            const [dr, dc] = directions[dir];
            let word = '';
            for (let i = 0; i < length; i++) {
                const nr = r + dr * i, nc = c + dc * i;
                if (nr >= 0 && nr < gameState.gridSize && nc >= 0 && nc < gameState.gridSize) {
                    word += gameState.grid[nr][nc];
                } else {
                    return 'Error:_Selection_out_of_bounds';
                }
            }
            const wordObj = gameState.words.find(w => !w.found && (w.word === word || w.word === word.split('').reverse().join('')));
            if (wordObj) {
                wordObj.found = true;
                gameState.found.push(wordObj.word);
                if (gameState.found.length === gameState.words.length) {
                    return `Word_"${word}"_found!\nAll_words_found!_Game_over!`;
                }
                return `Word_"${word}"_found!`;
            }
            return `No_word_found_at_${row}_${col}_${dir}_${length}`;
        },
        exit: () => {
            window.location.href = 'terminal.html';
            return 'Exiting_to_main_terminal...';
        }
    };

    function placeWords() {
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];
        gameState.words.forEach(wordObj => {
            let placed = false, attempts = 0;
            while (!placed && attempts < 100) {
                const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
                const len = wordObj.word.length;
                const maxStartR = dr >= 0 ? gameState.gridSize - len : gameState.gridSize - 1;
                const maxStartC = dc >= 0 ? gameState.gridSize - len : gameState.gridSize - 1;
                const r = Math.floor(Math.random() * (maxStartR + 1));
                const c = Math.floor(Math.random() * (maxStartC + 1));
                let fits = true;
                for (let i = 0; i < len; i++) {
                    const nr = r + dr * i, nc = c + dc * i;
                    if (nr < 0 || nr >= gameState.gridSize || nc < 0 || nc >= gameState.gridSize || (gameState.grid[nr][nc] && gameState.grid[nr][nc] !== wordObj.word[i])) {
                        fits = false;
                        break;
                    }
                }
                if (fits) {
                    for (let i = 0; i < len; i++) {
                        gameState.grid[r + dr * i][c + dc * i] = wordObj.word[i];
                    }
                    wordObj.pos = { r, c, dr, dc };
                    placed = true;
                }
                attempts++;
            }
        });
    }

    function fillGrid() {
        for (let r = 0; r < gameState.gridSize; r++) {
            for (let c = 0; c < gameState.gridSize; c++) {
                if (!gameState.grid[r][c]) {
                    gameState.grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                }
            }
        }
    }

    function print(text) {
        const div = document.createElement('div');
        div.innerHTML = text.replace(/\n/g, '<br>');
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    }

    print('Welcome_to_Word_Search_Terminal\nType_"help"_for_commands');

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const value = input.value.trim().toLowerCase();
            input.value = '';
            print(`>_ ${value}`);
            const [cmd, ...args] = value.split(' ');
            const argString = args.join('_');
            if (commands[cmd]) {
                const result = commands[cmd](argString);
                if (result) print(result);
            } else {
                print(`Error:_Command_"${cmd}"_not_found\nType_"help"_for_options`);
            }
        }
    });
});