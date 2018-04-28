module.exports = {
    and: and,
    or: or,
    not: not
}

const walk = require("./walk")

function and(ast, vars) {
    let ret = true

    for (let i = 1; i < ast.length; i++)
        ret = ret && walk(ast[i], vars)

    return ret
}

function or(ast, vars) {
    let ret = true

    for (let i = 1; i < ast.length; i++)
        ret = ret || walk(ast[i], vars)

    return ret
}

function not(ast, vars) {
    return !walk(ast[0], vars)
}
