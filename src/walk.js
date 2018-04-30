module.exports = walk

const arithmetic = require("./arithmetic")
const logic = require("./logic")
const variables = require("./variables")
const functions = require("./functions")

function walk(ast, vars) {
    if (!Array.isArray(ast)) {
        if (ast.type === "symbol") {
            return vars[ast.value]
        } else {
            return ast.value;
        }
    }

    if (ast.length === 1) {
        return walk(ast[0], vars)
    }

    if (Array.isArray(ast[0])) {
        let ret = []
        for (let el of ast) {
            ret.push(walk(el, vars))
        }
        return ret.filter((x) => x !== "").join("\n")
    }

    switch (ast[0].value) {
        case "+":
            return arithmetic.add(ast, vars)
        case "*":
            return arithmetic.mul(ast, vars)
        case "-":
            return arithmetic.sub(ast, vars)
        case "/":
            return arithmetic.div(ast, vars)
        case "%":
            return arithmetic.mod(ast, vars)
        case "//":
            return arithmetic.intdiv(ast, vars)

        case "and":
            return logic.and(ast, vars)
        case "or":
            return logic.or(ast, vars)
        case "not":
            return logic.not(ast, vars)

        case "defvar":
            return variables.defvar(ast, vars)
        case "set":
            return variables.set(ast, vars)

        case "defun":
            return functions.defun(ast, vars)

        default:
            // It's a function!
            return functions.call(ast, vars)
    }
}