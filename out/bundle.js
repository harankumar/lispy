(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const run = require("./src/main.js")

const editor = ace.edit("code");
editor.setTheme("ace/theme/chrome");
editor.setOptions({
    fontSize: "16px"
})
editor.session.setMode("ace/mode/lisp");
editor.commands.addCommand({
    name: "compile",
    bindKey: {win: "Ctrl-Enter", mac: "Ctrl-Enter", linux: "Ctrl-Enter"},
    exec: compileAndUpdate,
    readOnly: true
})

function compileAndUpdate() {
    const program = editor.getValue()

    document.getElementById("output").innerHTML = run(program)

}

document.getElementById("run").onclick = compileAndUpdate

},{"./src/main.js":8}],2:[function(require,module,exports){
module.exports = function flatten(list, depth) {
  depth = (typeof depth == 'number') ? depth : Infinity;

  if (!depth) {
    if (Array.isArray(list)) {
      return list.map(function(i) { return i; });
    }
    return list;
  }

  return _flatten(list, 1);

  function _flatten(list, d) {
    return list.reduce(function (acc, item) {
      if (Array.isArray(item) && d < depth) {
        return acc.concat(_flatten(item, d + 1));
      }
      else {
        return acc.concat(item);
      }
    }, []);
  }
};

},{}],3:[function(require,module,exports){
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
    let ret = ast[1].type === "string" ? "" : 0

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

},{"./walk":12}],4:[function(require,module,exports){
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
},{"./walk":12}],5:[function(require,module,exports){
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
},{"./html":6,"./walk":12}],6:[function(require,module,exports){
module.exports = {
    tag_render: tag_render,
    is_tag: is_tag
}

const walk = require("./walk")
const tags = new Set(require("./tags"))

function is_tag(tag) {
    return tags.has(tag)
}

function tag_render(ast, vars) {
    const tag = ast[0].value
    const attributes = ast[1]
        .map((attr) => `${attr[0].value}="${walk(attr[1], vars)}"`)
        .join(" ")
    const innerHTML = ast
        .slice(2)
        .map((el) => walk(el, vars))
        .join("")

    return `<${tag} ${attributes}>\n${innerHTML}\n</${tag}>\n`
}


},{"./tags":10,"./walk":12}],7:[function(require,module,exports){
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

},{"./walk":12}],8:[function(require,module,exports){
const parser = require("./parser")
const walk = require("./walk")
const flatten = require("flatten")

module.exports = run

function run(program) {
    const tokens = parser.tokenize(program)
    const ast = parser.parse(tokens)

    const output = walk(ast, {})
        .filter((x) => x !== "")
        .map((x) => {
            if (Array.isArray(x))
                return flatten(x).join(" ")
            else
                return x
        })
        .join(" ")

    // console.log(walk(ast, {}))

    return output
}

},{"./parser":9,"./walk":12,"flatten":2}],9:[function(require,module,exports){
module.exports = {
    tokenize: tokenize,
    classify: classify,
    parse: parse
}

function tokenize(prog) {
    // Remove comments, hacky but more or less gets the job done
    let program = ""
    for (let line of prog.split("\n"))
        if (line[0] !== ";")
            program += line + "\n"
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
    } else if (/^-?[0-9]+(\.[0-9]+)?$/.test(token)) {
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

},{}],10:[function(require,module,exports){
module.exports = [
  "a",
  "abbr",
  "acronym",
  "address",
  "applet",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "basefont",
  "bdi",
  "bdo",
  "bgsound",
  "big",
  "blink",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "center",
  "cite",
  "code",
  "col",
  "colgroup",
  "command",
  "content",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "element",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "font",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "image",
  "img",
  "input",
  "ins",
  "isindex",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "listing",
  "main",
  "mark",
  "marquee",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "multicol",
  "nav",
  "nextid",
  "nobr",
  "noembed",
  "noframes",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "plaintext",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "shadow",
  "slot",
  "small",
  "source",
  "spacer",
  "span",
  "strike",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "tt",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
  "xmp"
]
},{}],11:[function(require,module,exports){
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

},{"./walk":12}],12:[function(require,module,exports){
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
},{"./arithmetic":3,"./comparison":4,"./functions":5,"./logic":7,"./variables":11}]},{},[1]);
