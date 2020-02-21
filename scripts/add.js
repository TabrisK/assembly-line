const path = require("path");
const fs = require("fs");

const srcDir = path.resolve("src");

const fileTemplatePath = path.resolve(__dirname, "../file-template");
const typeExtensionMap = fs.readdirSync(fileTemplatePath).reduce((acc, cur) => {
    const { name, ext } = path.parse(cur);
    if (ext) {
        acc[name] = ext;
    } else {
        const stat = fs.statSync(path.resolve(fileTemplatePath, name));
        if (!stat.isDirectory()) {
            acc[name] = "";
        }
    }
    return acc;
}, {});

module.exports = (newPath, type) => {

    if (typeExtensionMap[type]) { // treat as file
        const dirname = path.dirname(newPath),
            fileName = path.basename(newPath)
        const parentDir = path.resolve(srcDir, type, dirname);
        checkDirExist(parentDir);
        const read = fs.createReadStream(path.resolve(fileTemplatePath, `${type}${typeExtensionMap[type]}`));
        const write = fs.createWriteStream(path.resolve(srcDir, parentDir, `${fileName}${typeExtensionMap[type]}`));
        read.pipe(write);
    } else { // treat as directory
        const dirList = newPath.replace(/^\.\//, "").split("/").map(firstLetterUppercase);
        checkDirExist(path.resolve(srcDir, type, dirList.join("/")));

        dirList.reduce((acc, cur) => {
            const curDir = path.resolve(acc, cur);
            const keyFilePath = path.resolve(curDir, "index.tsx");
            try {
                fs.accessSync(keyFilePath, fs.constants.F_OK);
            } catch (err) {
                // if index.tsx file doesn't exist, copy template file to the directory.
                fs.readdirSync(path.resolve(fileTemplatePath, type)).forEach((name) => {
                    const srcFilePath = path.resolve(fileTemplatePath, type, name),
                        destFilePath = path.resolve(curDir, name);
                    try {
                        fs.copyFileSync(srcFilePath, destFilePath, fs.constants.COPYFILE_EXCL);
                    } catch (err) {

                    }
                });
            }
            return curDir;
        }, path.resolve(srcDir, type));
    }

}

function checkDirExist(tarDir) {
    try {
        fs.accessSync(tarDir, fs.constants.F_OK);
    } catch (err) {
        // folder doesn't exist
        fs.mkdirSync(tarDir, { recursive: true });
    }
}

function firstLetterUppercase(text) {
    return text.substring(0, 1).toUpperCase() + text.substring(1);
}