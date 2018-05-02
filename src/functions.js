module.exports = {
    fun: fun,
    call: call
}

const walk = require("./walk")
const html = require("./html")

function fun(ast, vars) {
    const name = ast[1].value
    const params = ast[2].map((p) => p.value)
    const block = ast[3]

    const func = function () {
        // Save stuff to be recovered when we leave the function's scope
        const overwritten_vars = {}
        for (let param of params){
            if (vars[param])
                overwritten_vars[param] = vars[param]
        }

        // Get the arguments
        let i = 0
        for (let param of params) {
            vars[param] = arguments[i]
            i++
        }

        // Evaluate function
        const ret = walk(block, vars)

        // Clean up
        for (let param of params){
            if (overwritten_vars[param])
                vars[param] = overwritten_vars[param]
            else
                delete vars[param]
        }

        return ret
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

function print(ast, vars) {
    return ast.slice(1).map((x) => walk(x, vars)).join(" ") + "<br/>"
}

function _for(ast, vars) {
    /**
     * (for x in (range 1 10) (print x))
     *
     * */
    const loop_var = ast[1].value;
    const list = walk(ast[3], vars)
    const block = ast[4]

    const block_scope = !vars.hasOwnProperty(loop_var)
    const ret = []

    for (let el of list) {
        vars[loop_var] = el
        ret.push(walk(block, vars))
    }

    if (block_scope)
        delete vars[loop_var]

    return ret.join(" ")
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
        case "print":
            return print(ast, vars)
        case "for":
            return _for(ast, vars)
    }

    const func = vars[ast[0].value]
    const args = ast.slice(1).map((arg) => walk(arg, vars))

    if (typeof func === "function")
        return func(...args)
    else
        console.log(`${ast[0].value} is not a function!`)
}