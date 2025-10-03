#!/usr/bin/env node

const readline = require("readline")
const { downloadTemplate } = require("@bluwy/giget-core")
const path = require("path")
const fs = require("fs")

const choices = ["Beginner", "Intermediate", "Advanced"]
let selected = 0

// Hide the cursor
process.stdout.write("\x1B[?25l")

function render() {
    console.clear()
    console.log("Choose which kit you want to install:\n")
    choices.forEach((choice, i) => {
        if (i === selected) {
            console.log(`> ${choice}`) // highlight selected
        } else {
            console.log(`  ${choice}`)
        }
    })
    console.log("\nUse ↑/↓ arrows and press Enter to confirm.")
}

async function installTemplate(choice) {
    console.log(`\n🚀 Installing ${choice} kit...\n`)

    // Define repo URL based on choice
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
        default:
            console.error("❌ Invalid choice.")
            process.exit(1)
    }

    // Destination folder
    const targetDir = path.resolve(process.cwd(), choice.toLowerCase())

    // Prevent overwrite
    if (fs.existsSync(targetDir)) {
        console.error(`❌ Directory "${targetDir}" already exists.`)
        process.stdout.write("\x1B[?25h")
        process.exit(1)
    }

    try {
        await downloadTemplate(repoUrl, { dir: targetDir })
        console.log(`\n✅ Successfully installed ${choice} kit into "${targetDir}"`)
    } catch (err) {
        console.error("\n❌ Failed to install template:", err.message)
    }

    // Show cursor again
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
        process.stdin.setRawMode(false)
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
