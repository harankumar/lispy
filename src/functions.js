module.exports = {
    fun: fun,
    call: call
}

const walk = require("./walk")
const html = require("./html")

function fun(ast, vars) {
    const name = ast[1].value
    const params = ast[2]
    const block = ast[3]

    const func = function () {
        const args = {}
        let i = 0
        for (let param of params) {
            args[param.value] = arguments[i]
            i++
        }

        // Functions can't access global scope
        return walk(block, args)
    }

    vars[name] = func

    return ""
}

function map(ast, vars) {
    const func = vars[ast[1].value]
    const list = walk(ast[2], vars)

    return list.map(func)
}

function range(ast, vars) {
    // Emulates Python range() function
    let start, stop, step = 1

    switch (ast.length) {
        case 2:
            start = 0
            stop = walk(ast[1], vars)
            break;
        case 4:
            step = walk(ast[3], vars)
        case 3:
            start = walk(ast[1], vars)
            stop = walk(ast[2], vars)
    }

    const ret = []

    for (let i = start; i < stop; i += step)
        ret.push(i)

    return ret
}

function reduce(ast, vars) {
    const func = vars[ast[1].value]
    const init = walk(ast[2], vars)
    const list = walk(ast[3], vars)

    return list.reduce(func, init)
}

function filter(ast, vars) {
    const func = vars[ast[1].value]
    const list = walk(ast[2], vars)

    return list.filter(func)
}

function _if(ast, vars) {
    const test = walk(ast[1], vars)

    if (test)
        return walk(ast[2], vars)
    else
        return walk(ast[3], vars)
}

function call(ast, vars) {
    if (html.is_tag(ast[0].value)) {
        return html.tag_render(ast, vars)
    }

    switch (ast[0].value) {
        case "map":
            return map(ast, vars)
        case "range":
            return range(ast, vars)
        case "list":
            return ast.slice(1).map((x) => walk(x, vars))
        case "if":
            return _if(ast, vars)
        case "reduce":
            return reduce(ast, vars)
        case "filter":
            return filter(ast, vars)
    }

    const func = vars[ast[0].value]
    const args = ast.slice(1).map(walk)

    return func(...args)
}