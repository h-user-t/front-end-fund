function TerminalUI(output, input, currentDir) {
    this.output = output;
    this.input = input;
    this.prompt = input.previousElementSibling;
    this.currentDir = currentDir;

    // Define methods before calling them
    this.updatePrompt = function(dir) {
        this.currentDir = dir;
        this.prompt.textContent = `${dir} >_`;
    };

    this.print = function(text) {
        this.output.innerHTML += `${text.replace(/\n/g, '<br>')}<br>`;
        this.output.scrollTop = this.output.scrollHeight;
    };

    this.clear = function() {
        this.output.innerHTML = '';
    };

    // Now call updatePrompt and print after methods are defined
    this.updatePrompt(currentDir);
    this.print('Welcome to Hunter\'s Terminal\nType "help" for commands');
}