#!/usr/bin/env node

import readline from "readline"
import { downloadTemplate } from "@bluwy/giget-core"
import path from "path"
import fs from "fs"
import ora from "ora"

const choices = ["Beginner", "Intermediate", "Advanced"]
let selected = 0
let projectName = ""

// Hide cursor
process.stdout.write("\x1B[?25l")

// Helper to ask for input
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            rl.close()
            resolve(answer.trim())
        })
    })
}

function render() {
    console.clear()
    console.log("Choose which kit you want to install:\n")
    choices.forEach((choice, i) => {
        if (i === selected) {
            console.log(`> ${choice}`)
        } else {
            console.log(`  ${choice}`)
        }
    })
    console.log("\nUse ↑/↓ arrows and press Enter to confirm.")
}

async function installTemplate(choice) {
    if (process.stdin.isTTY) process.stdin.setRawMode(false)
    process.stdin.removeListener("keypress", handleKeypress)

    console.clear()
    console.log(`\n🚀 Installing ${choice} kit...\n`)

    projectName = await askQuestion("📁 Enter a name for your project: ")
    if (!projectName) {
        console.error("❌ Project name cannot be empty.")
        process.stdout.write("\x1B[?25h")
        process.exit(1)
    }

    const confirm = await askQuestion(`\nCreate project in folder "${projectName}"? (Y/n): `)
    if (confirm.toLowerCase() === "n") {
        console.log("❌ Installation cancelled.")
        process.stdout.write("\x1B[?25h")
        process.exit(0)
    }

    let repoUrl = ""
    switch (choice) {
        case "Beginner":
            repoUrl = "github:CodeStitchOfficial/Beginner-Astro-Starter-Kit"
            break
        case "Intermediate":
            repoUrl = "github:CodeStitchOfficial/Intermediate-Astro-Decap-CMS"
            break
        case "Advanced":
            repoUrl = "github:CodeStitchOfficial/Advanced-Astro-i18n"
            break
    }

    const targetDir = path.resolve(process.cwd(), projectName)

    if (fs.existsSync(targetDir)) {
        console.error(`❌ Directory "${targetDir}" already exists.`)
        process.stdout.write("\x1B[?25h")
        process.exit(1)
    }

    const spinner = ora(`Downloading ${choice} kit...`).start()

    try {
        await downloadTemplate(repoUrl, { dir: targetDir })
        spinner.succeed(`✅ Successfully installed ${choice} kit into "${targetDir}"`)
    } catch (err) {
        spinner.fail("❌ Failed to install template")
        console.error(err.message)
    }

    process.stdout.write("\x1B[?25h")
    process.exit(0)
}

function handleKeypress(str, key) {
    if (key.name === "up") {
        selected = (selected - 1 + choices.length) % choices.length
        render()
    } else if (key.name === "down") {
        selected = (selected + 1) % choices.length
        render()
    } else if (key.name === "return") {
        installTemplate(choices[selected])
    } else if (key.name === "c" && key.ctrl) {
        process.stdout.write("\x1B[?25h")
        process.exit(0)
    }
}

// Initialize key listener
readline.emitKeypressEvents(process.stdin)
if (process.stdin.isTTY) process.stdin.setRawMode(true)
process.stdin.on("keypress", handleKeypress)

render()
