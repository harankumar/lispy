const fs = require("fs")

const parser = require("./parser")
const walk = require("./walk")

// Run the file from the command line
const file = process.argv[2]
const program = fs.readFileSync(file).toString()

console.log(walk(parser.parse(parser.tokenize(program)), {}))