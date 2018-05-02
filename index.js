const run = require("./src/main.js")

const editor = ace.edit("code");
editor.setTheme("ace/theme/chrome");
editor.setOptions({
    fontSize: "16px"
})
editor.session.setMode("ace/mode/lisp");

document.getElementById("run").onclick = function () {
    const program = editor.getValue()

    document.getElementById("output").innerHTML = run(program)

}