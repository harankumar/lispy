module.exports = walk

const arithmetic = require("./arithmetic")
const logic = require("./logic")
const variables = require("./variables")
const functions = require("./functions")
const comparison = require("./comparison")

function walk(ast, vars) {
    if (!Array.isArray(ast)) {
        if (ast.type === "symbol") {
            return vars[ast.value]
        } else {
            return ast.value;
        }
    }

    if (Array.isArray(ast[0])) {
        let ret = []
        for (let el of ast) {
            ret.push(walk(el, vars))
        }
        return ret
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

        case "=":
            return comparison.eq(ast, vars)
        case "<":
            return comparison.lt(ast, vars)
        case ">":
            return comparison.gt(ast, vars)
        case "!=":
            return comparison.neq(ast, vars)
        case "<=":
            return comparison.leq(ast, vars)
        case ">=":
            return comparison.geq(ast, vars)

        case "and":
            return logic.and(ast, vars)
        case "or":
            return logic.or(ast, vars)
        case "not":
            return logic.not(ast, vars)

        case "let":
            return variables._let(ast, vars)
        case "set":
            return variables.set(ast, vars)

        case "fun":
            return functions.fun(ast, vars)

        default:
            // It's a function!
            return functions.call(ast, vars)
    }
}