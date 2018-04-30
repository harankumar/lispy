const fs = require("fs")

const parser = require("./parser")
const walk = require("./walk")

// Run the file from the command line
const file = process.argv[2]
const program = fs.readFileSync(file).toString()

const output = walk(parser.parse(parser.tokenize(program)), {})
                .filter((x) => x !== "").join("\n")

// Output to file
const outputFile = file.split(".").slice(0, -1).join(".") + ".html"
fs.writeFileSync(outputFile, output)