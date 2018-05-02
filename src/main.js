const parser = require("./parser")
const walk = require("./walk")
const flatten = require("flatten")

module.exports = run

function run(program) {
    const tokens = parser.tokenize(program)
    const ast = parser.parse(tokens)
    const output = walk(ast, {})

    return flatten(output.filter((x) => x !== "")).join("\n")
}
