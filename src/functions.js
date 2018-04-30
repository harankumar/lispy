module.exports = {
    defun: defun,
    call: call
}

const walk = require("./walk")
const html = require("./html")

function defun(ast, vars) {
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
    const list = ast[2].map(walk)

    console.log(ast[2])

    return list.map(func)
}

function call(ast, vars) {
    if (html.is_tag(ast[0].value)) {
        return html.tag_render(ast, vars)
    }

    switch (ast[0].value) {
        case "map":
            return map(ast, vars)
    }

    const func = vars[ast[0].value]
    const args = ast.slice(1).map(walk)

    return func(args)
}