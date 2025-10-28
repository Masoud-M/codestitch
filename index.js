#!/usr/bin/env node

import { intro, outro, select, text, confirm, spinner } from "@clack/prompts";
import { downloadTemplate } from "@bluwy/giget-core";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import chalk from "chalk";

async function main() {
    console.clear();

    intro(chalk.cyan("🚀 Welcome to Codestitch Astro Kit Installer"));

    const kitChoice = await select({
        message: chalk.bold("Choose which Astro kit you want to install:"),
        options: [
            {
                label: `${chalk.greenBright("✨ Beginner")}  ${chalk.dim("— Starter kit for learning Astro basics")}`,
                value: "Beginner",
            },
            {
                label: `${chalk.cyanBright("🧠 Intermediate")}  ${chalk.dim("— Blog ready with DecapCMS integration")}`,
                value: "Intermediate",
            },
            {
                label: `${chalk.magentaBright("🚀 Advanced")}  ${chalk.dim("— i18n + DecapCMS setup for production")}`,
                value: "Advanced",
            },
            {
                label: `${chalk.magentaBright("🛒 E-commerce")}  ${chalk.dim("— Headless Shopify + DecapCMS setup for production")}`,
                value: "Shopify",
            },
        ],
    });

    if (!kitChoice) {
        outro(chalk.red("❌ Installation cancelled."));
        process.exit(0);
    }

    const projectName = await text({
        message: "Enter a name for your project:",
        placeholder: "my-codestitch-site",
        validate(value) {
            if (!value || value.trim() === "") return "Project name cannot be empty.";
        },
    });

    const targetDir = path.resolve(process.cwd(), projectName);

    if (fs.existsSync(targetDir)) {
        outro(chalk.red(`❌ Directory "${projectName}" already exists.`));
        process.exit(1);
    }

    const proceed = await confirm({
        message: `Create project in folder "${projectName}"?`,
    });

    if (!proceed) {
        outro(chalk.yellow("⚠️  Installation cancelled."));
        process.exit(0);
    }

    const repoMap = {
        Beginner: "github:CodeStitchOfficial/Beginner-Astro-Starter-Kit",
        Intermediate: "github:CodeStitchOfficial/Intermediate-Astro-Decap-CMS",
        Advanced: "github:CodeStitchOfficial/Advanced-Astro-i18n",
        Shopify: "github:Masoud-M/astro-shopify"
    };

    const repoUrl = repoMap[kitChoice];


    const s = spinner();
    s.start(`Downloading ${kitChoice} kit...`);

    try {
        await downloadTemplate(repoUrl, { dir: targetDir });
        s.stop(chalk.green(`✅ Installed ${kitChoice} kit successfully!`));
    } catch (err) {
        s.stop(chalk.red("❌ Failed to download template."));
        console.error(err.message);
        process.exit(1);
    }

    const pm = await select({
        message: "Choose your package manager:",
        options: [
            { label: "npm", value: "npm" },
            { label: "pnpm", value: "pnpm" },
            { label: "yarn", value: "yarn" },
            { label: "bun", value: "bun" },
        ],
    });

    const installCmd = {
        npm: "npm install",
        pnpm: "pnpm install",
        yarn: "yarn install",
        bun: "bun install",
    }[pm];

    const s2 = spinner();
    s2.start(`Installing dependencies with ${pm}...`);

    try {
        execSync(installCmd, { stdio: "inherit", cwd: targetDir });
        s2.stop(chalk.green(`✅ Dependencies installed successfully.`));
    } catch (err) {
        s2.stop(chalk.red("❌ Failed to install dependencies."));
    }

    outro(
        chalk.greenBright(`
✅ All done!

Next steps:
  1. cd ${chalk.cyan(projectName)}
  2. ${chalk.cyan(`${pm} run dev`)}

Happy coding with Codestitch Astro! 🌟
`)
    );
}

main().catch((err) => {
    console.error(chalk.red("❌ Unexpected error:"), err);
    process.exit(1);
});
