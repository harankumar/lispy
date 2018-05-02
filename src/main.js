const parser = require("./parser")
const walk = require("./walk")
const flatten = require("flatten")

module.exports = run

function run(program) {
    const tokens = parser.tokenize(program)
    const ast = parser.parse(tokens)

    const output = walk(ast, {})
        .filter((x) => x !== "")
        .map((x) => {
            if (Array.isArray(x))
                return flatten(x).join(" ")
            else
                return x
        })
        .join(" ")

    // console.log(walk(ast, {}))

    return output
}
