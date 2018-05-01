module.exports = {
    eq: eq,
    lt: lt,
    gt: gt,
    neq: neq,
    leq: leq,
    geq: geq
}

const walk = require("./walk")

function eq(ast, vars) {
    const lhs = walk(ast[1], vars)
    const rhs = walk(ast[2], vars)

    return lhs === rhs
}

function lt(ast, vars) {
    const lhs = walk(ast[1], vars)
    const rhs = walk(ast[2], vars)

    return lhs < rhs
}

function gt(ast, vars) {
    const lhs = walk(ast[1], vars)
    const rhs = walk(ast[2], vars)

    return lhs > rhs
}

function neq(ast, vars) {
    const lhs = walk(ast[1], vars)
    const rhs = walk(ast[2], vars)

    return lhs !== rhs
}

function leq(ast, vars) {
    const lhs = walk(ast[1], vars)
    const rhs = walk(ast[2], vars)

    return lhs <= rhs
}

function geq(ast, vars) {
    const lhs = walk(ast[1], vars)
    const rhs = walk(ast[2], vars)

    return lhs >= rhs
}