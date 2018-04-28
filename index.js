(function () {
    const fs = require("fs")

    // Run the file from the command line
    const file = process.argv[2]
    const program = fs.readFileSync(file).toString()

    console.log(walk(parse(tokenize(program)), {}))
})()

function tokenize(program) {
    const tokens = []
    const string_split = program.split('"')

    for (let i = 0; i < string_split.length; i++) {
        // Every other element is the interior of a string
        if (i % 2 === 0) {
            const sep_split = string_split[i]
                .replace(/\(/g, " ( ") // so that parens get their own tokens, regardless of whitespace
                .replace(/\)/g, " ) ")
                .split(/\s+/g)
            for (let token of sep_split) {
                if (token !== "") {
                    tokens.push(token)
                }
            }
        } else {
            tokens.push(`"${string_split[i]}"`)
        }
    }

    return tokens.map(classify)
}

function classify(token) {
    const classification = {}

    if (token === "(" || token === ")") {
        return token
    } else if (token[0] === '"') {
        classification.value = token.slice(1, token.length - 1)
        classification.type = "string"
    } else if (/^[0-9]+(\.[0-9]+)?$/.test(token)) {
        // No point in separating ints and floats b/c JS can't handle it
        classification.value = Number.parseFloat(token)
        classification.type = "float"
    } else if (token === "true" || token === "false") {
        classification.value = token === "true"
        classification.type = "bool"
    } else {
        classification.value = token
        classification.type = "symbol"
    }

    return classification
}

function parse(tokens) {
    const program = [[]] // starts with a dummy parent, everything folds into it

    for (let token of tokens) {
        if (token === "(") {
            // start a new list
            program.push([])
        } else if (token === ")") {
            // Nest back into the parent
            const last = program.pop()
            program[program.length - 1].push(last)
        } else {
            // add to the list on the top of the stack
            program[program.length - 1].push(token)
        }
    }

    // un-nest
    return program[0]
}

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
        return ret
    }

    switch (ast[0].value) {
        case "+":
            return add(ast, vars)
        case "*":
            return mul(ast, vars)
        case "-":
            return sub(ast, vars)
        case "/":
            return div(ast, vars)
        case "%":
            return mod(ast, vars)
        case "//":
            return intdiv(ast, vars)

        case "and":
            return and(ast, vars)
        case "or":
            return or(ast, vars)
        case "not":
            return not(ast, vars)

        case "defvar":
            return defvar(ast, vars)
        case "set":
            return set(ast, vars)
    }

    return ast
}

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

function defvar(ast, vars) {
    vars[ast[1].value] = walk(ast[2], vars)
    return "" // TODO -- is this the right thing? maybe should be null
}

function set(ast, vars) {
    vars[ast[1].value] = walk(ast[2], vars)
    return ""
}