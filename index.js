const run = require("./src/main.js")

document.getElementById("run").onclick = function () {
    const program = document.getElementById("code").value

    const output = run(program)

    document.getElementById("output").innerHTML = output

}