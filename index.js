#!/usr/bin/env node
'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err;
});

const { spawnSync } = require('child_process');
const add = require("./scripts/add");

const ADD_TYPES = ["page", "component", "lib", "widget"];

const argv = require("yargs")
    .command("add <path>", "Add valid file to your project.This is the official way to add files.", (yargs) => {
        return yargs.option("type", {
            alias: "t",
            describe: "file type. default page.",
            choices: ADD_TYPES,
            default: ADD_TYPES[0]
        }).positional("path", {
            describe: "module path.",
            type: "string",
            default: "new_page"
        }).demandOption("path");
    }, (argv) => {
        const { path, type } = argv;
        if (/^(?:\.\.\/)|^(?:\/)/.test(path)) {
            console.log("can't use / or ../ ahead of the file path.");
            process.exit(0);
        }
        if (argv.verbose) console.info("Bob! do something!");
        add(path, type);
    })
    .command("valid", "Validate the project structure.", () => { }, (argv) => {
        spawnSync("node", [`${__dirname}/scripts/valid.js`], { stdio: "inherit" });
    })
    .help("h")
    .argv;