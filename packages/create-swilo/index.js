#!/usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import { createSpinner } from "nanospinner";
// Temporary Solution for getting the current version of the package
import { execa } from "execa";
import gunzipMaybe from "gunzip-maybe";
import { createRequire } from "node:module";
import path from "node:path";
import stream from "node:stream";
import { promisify } from "node:util";
import tar from "tar-fs";

const require = createRequire(import.meta.url);
const spinner = createSpinner();

const MAIN_COLOR = "#FCE205";
const CURR_SWILO_VERSION = require("./package.json").version;
const CURR_DIR = process.cwd();
const TEMPLATE_URL = "https://api.github.com/repos/swilojs/swilo/tarball/main";
//

// Copied from remix-node/stream.ts
async function writeReadableStreamToWritable(stream, writable) {
  let reader = stream.getReader();
  let flushable = writable;

  try {
    while (true) {
      let { done, value } = await reader.read();

      if (done) {
        writable.end();
        break;
      }

      writable.write(value);
      if (typeof flushable.flush === "function") {
        flushable.flush();
      }
    }
  } catch (error) {
    writable.destroy(error);
    throw error;
  }
}

const pipeline = promisify(stream.pipeline);

async function downloadAndExtractTarball(projectDirectory) {
  const result = await fetch(TEMPLATE_URL);
  let input = new stream.PassThrough();
  // Start reading stream into passthrough, don't await to avoid buffering
  writeReadableStreamToWritable(result.body, input);
  const filePath = "packages/swilo";
  await pipeline(
    input,
    gunzipMaybe(),
    tar.extract(projectDirectory, {
      map: (header) => {
        let originalDirName = header.name.split("/")[0];
        header.name = header.name.replace(`${originalDirName}/`, "");
        if (filePath) {
          // Include trailing slash on startsWith when filePath doesn't include
          // it so something like `packages/swilo` doesn't inadvertently
          // include `packages/swilo-javascript/*` files
          // Copied from create-remix
          if (
            (filePath.endsWith(path.posix.sep) &&
              header.name.startsWith(filePath)) ||
            (!filePath.endsWith(path.posix.sep) &&
              header.name.startsWith(filePath + path.posix.sep))
          ) {
            header.name = header.name.replace(filePath, "");
          } else {
            header.name = "__IGNORE__";
          }
        }

        return header;
      },
      ignore(_filename, header) {
        if (!header) {
          throw Error("\nHeader is undefined");
        }
        return header.name === "__IGNORE__";
      },
    })
  );
}

// MAIN

console.log(
  chalk.bold(`\n${chalk.hex(MAIN_COLOR).bold(CURR_SWILO_VERSION)} ☀️  SWILO\n`)
);

const projectDirectory = await inquirer
  .prompt([
    {
      name: "projectDir",
      message: "Where should we create your new project?",
      default: "new-swilo",
      type: "input",
    },
  ])
  .then((input) => input.projectDir);

spinner.start({
  text: chalk
    .hex(MAIN_COLOR)
    .bold(
      `Copying template to: ${projectDirectory === "." ? "Current directory" : projectDirectory} `
    ),
});

await downloadAndExtractTarball(projectDirectory);

spinner.success();

const gitInit = await inquirer
  .prompt([
    {
      name: "gitInit",
      message: "Initialize git repository? (recommended)",
      type: "confirm",
    },
  ])
  .then((input) => input.gitInit);

spinner.start({
  text: chalk.hex(MAIN_COLOR).bold(`Initializing git. `),
});

if (gitInit) {
  try {
    let options = { cwd: CURR_DIR, stdio: "ignore" };
    await execa("git", ["init"], options);
    await execa("git", ["branch", "-m", "main"], options);
    await execa("git", ["add", "."], options);
    await execa("git", ["commit", "-m", "init"], options);

    spinner.success();
  } catch (error) {
    console.log("\nOh no! Failed to initialized git");
    throw error;
  }
}

console.log("\nDone!\n");

console.log(
  `Remember to install dependencies by running ${chalk.hex(MAIN_COLOR).bold("pnpm install")} | ${chalk.hex(MAIN_COLOR).bold("npm install")} | ${chalk.hex(MAIN_COLOR).bold("yarn install")}.`
);
console.log(
  `Enter your project directory using ${chalk.hex(MAIN_COLOR).bold(`cd ${projectDirectory}`)}\n`
);

console.log(
  `If you happen to come across any bugs, please file an issue at ${chalk.hex(MAIN_COLOR).underline("https://github.com/swilojs/swilo/issues")} \n\n`
);
