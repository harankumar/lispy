module.exports = {
    tag_render: tag_render,
    is_tag: is_tag
}

const walk = require("./walk")

const tags = new Set(["html", "head", "body", "div", "span", "b", "i"])

function is_tag(tag) {
    return tags.has(tag)
}

function tag_render(ast, vars) {
    const tag = ast[0].value
    const innerHTML = ast.slice(1).map((el) => walk(el, vars)).join("")

    return `<${tag}>\n${innerHTML}\n</${tag}>\n`
}

