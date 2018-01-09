(function () {
    const fs = require("fs")

    // Run the file from the command line
    const file = process.argv[2]
    const program = fs.readFileSync(file).toString()

    console.log(walk(parse(tokenize(program))))
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
    return program[0][0]
}

function walk(ast) {
    // TODO -- make this do stuff!!!
    return JSON.stringify(ast)
}