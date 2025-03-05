document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const input = document.getElementById('command-input');

    const commands = {
        help: () => `
            Available_commands:
            > help - Display_this_message
            > about - About_me
            > projects - List_my_projects
            > skills - My_skillset
            > contact - Contact_info
            > hack - Simulate_a_hack_(fun!)
            > analyze - Analyze_input_text
            > clear - Clear_terminal
            > date - Current_date
            > open_[project] - Open_a_project_(e.g.,_open_word_search_game)
            > exit - Return_to_hub
        `,
        about: () => `
            Hunter_Todd
            Senior_at_University_of_Miami
            Major:_Software_Engineering
            Links:_<a href="#">Twitter</a>_<a href="#">LinkedIn</a>
        `,
        projects: () => `
            Project_1:_Cool_UI_design_<a href="https://h-user-t.github.io/front-end-fund/project-1/">View</a>
            Project_2:_Dynamic_web_app_<a href="#">View</a>
            Project_3:_Word_Search_Game_<a href="https://h-user-t.github.io/front-end-fund/project-1/">View</a>
        `,
        skills: () => `
            HTML_[90%] - Semantic_markup
            CSS_[85%] - Styling_mastery
            JavaScript_[80%] - Interactive_code
        `,
        contact: () => `
            Email:_hunter.todd@example.com
            Location:_Coral_Gables,_FL
            Type_'contact_send_[name]_[email]_[message]'_to_send_a_message
        `,
        hack: () => {
            let hackText = 'Initializing_hack_sequence...\n';
            for (let i = 0; i < 5; i++) {
                hackText += `Attempt_${i + 1}:_${Math.random().toString(36).substring(2, 15)}\n`;
            }
            hackText += 'Access_granted!';
            return hackText;
        },
        analyze: (args) => {
            if (!args) return 'Error:_Provide_text_to_analyze';
            const words = args.split('_').filter(w => w);
            const wordCount = {};
            words.forEach(w => wordCount[w] = (wordCount[w] || 0) + 1);
            return `Word_count:\n${Object.entries(wordCount).map(([w, c]) => `${w}:_${c}`).join('\n')}`;
        },
        clear: () => {
            output.innerHTML = '';
            return '';
        },
        date: () => `Current_date:_${new Date().toLocaleDateString()}`,
        open: (args) => {
            if (!args) return 'Error:_Specify_a_project_(e.g.,_open_word_search_game)';
            if (args === 'word_search_game') {
                window.location.href = 'https://h-user-t.github.io/front-end-fund/project-1/';
                return 'Opening_Word_Search_Game...';
            }
            return 'Error:_Project_not_found';
        },
        exit: () => {
            window.location.href = 'index.html';
            return 'Exiting...';
        },
        contact_send: (args) => {
            const [name, email, ...message] = args.split('_');
            if (!name || !email || !message.length) return 'Error:_Format_is_contact_send_name_email_message';
            if (!/\S+@\S+\.\S+/.test(email)) return 'Error:_Invalid_email';
            return `Message_sent_from_${name}_(${email}):_${message.join('_')}`;
        }
    };

    function print(text) {
        const div = document.createElement('div');
        div.innerHTML = text.replace(/\n/g, '<br>');
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    }

    print('Welcome_to_Hunter_Todd\'s_Terminal\nType_"help"_for_commands');

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