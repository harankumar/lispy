module.exports = {
    add: add,
    mul: mul,
    sub: sub,
    div: div,
    intdiv: intdiv,
    mod: mod
}

const walk = require("./walk")

function add(ast, vars) {
    let ret = 0

    for (let i = 1; i < ast.length; i++)
        ret += walk(ast[i], vars)

    return ret
}

function mul(ast, vars) {
    let ret = 1

    for (let i = 1; i < ast.length; i++)
        ret *= walk(ast[i], vars)

    return ret
}

function sub(ast, vars) {
    return walk(ast[1], vars) - walk(ast[2], vars)
}

function div(ast, vars) {
    return walk(ast[1], vars) / walk(ast[2], vars)
}

function intdiv(ast, vars) {
    return Math.floor(walk(ast[1], vars) / walk(ast[2], vars))
}

function mod(ast, vars) {
    return walk(ast[1], vars) % walk(ast[2], vars)
}
