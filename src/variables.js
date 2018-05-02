module.exports = {
    _let: _let,
    set: set
}

const walk = require("./walk")

function _let(ast, vars) {
    vars[ast[1].value] = walk(ast[2], vars)
    return "" // TODO -- is this the right thing? maybe should be null
}

function set(ast, vars) {
    vars[ast[1].value] = walk(ast[2], vars)
    return ""
}
