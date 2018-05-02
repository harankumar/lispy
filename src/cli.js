const fs = require("fs")
const run = require("./main")

// Run the file from the command line
const file = process.argv[2]
const program = fs.readFileSync(file).toString()

const output = run(program)

// Output to file
const outputFile = file.split(".").slice(0, -1).join(".") + ".html"
fs.writeFileSync(outputFile, output)