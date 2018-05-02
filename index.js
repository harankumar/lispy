const run = require("./src/main.js")

const editor = ace.edit("code");
editor.setTheme("ace/theme/chrome");
editor.setOptions({
    fontSize: "16px"
})
editor.session.setMode("ace/mode/lisp");
editor.commands.addCommand({
    name: "compile",
    bindKey: {win: "Ctrl-Enter", mac: "Ctrl-Enter", linux: "Ctrl-Enter"},
    exec: compileAndUpdate,
    readOnly: true
})

function compileAndUpdate() {
    const program = editor.getValue()

    document.getElementById("output").innerHTML = run(program)

}

document.getElementById("run").onclick = compileAndUpdate
