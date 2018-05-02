const parser = require("./parser")
const walk = require("./walk")

module.exports = run

function run(program) {
    const tokens = parser.tokenize(program)
    const ast = parser.parse(tokens)
    const output = walk(ast, {})

    return output.filter((x) => x !== "").join("\n")
}
