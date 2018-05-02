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

