const core = require("@actions/core");
const exec = require("@actions/exec");
const fs = require("fs");


const REGEXPRS = {
    "package.json": /"version"(\s+|\s?):(\s+|\s?)"(([0-9]+(\.?))+)"/,
    "pyproject.toml": /version(\s+|\s?)=(\s+|\s?)("?)(([0-9]+(\.?))+)("?)/
}


function ensureFileExists(filename) {
    if (!fs.existsSync(filename)) {
        throw new Error(`File not found: ${filename}`);
    }
}

function updateFile(filename, replacement) {
    let data = fs.readFileSync(filename, "utf8");
    data = data.replace(REGEXPRS[filename], replacement);
    fs.writeFileSync(filename, data, "utf8");
}

async function updatePackageJson(target_version) {
    const filename = "package.json";

    // Update package.json version:
    updateFile(filename, `"version": "${target_version}"`);

    // Update package-lock.json version:
    await exec.exec("npm", ["install"]);
}

async function updatePyProjectToml(target_version) {
    const filename = "pyproject.toml";

    // Update pyproject.toml version:
    updateFile(filename, `version = "${target_version}"`);
}

const main = async () => {
    try {
        // Retrieve inputs:
        const git_email = core.getInput("git-email");
        const git_name = core.getInput("git-name");
        let target_version = core.getInput("target-version");
        const target_file = core.getInput("target-file");
        const target_branch = core.getInput("target-branch");

        // Ensure file exists:
        ensureFileExists(target_file);

        // Format tag:
        target_version = target_version.replace(/^refs\/tags\/v/, "");

        // Update project file:
        switch (target_file) {
            case "package.json":
                updatePackageJson(target_version);
                break;
            case "pyproject.toml":
                updatePyProjectToml(target_version);
                break;
            default:
                throw new Error(`Unsupported file: ${target_file}`);
        }

        // Configure git:
        await exec.exec("git", ["config", "--global", "user.email", git_email]);
        await exec.exec("git", ["config", "--global", "user.name", git_name]);

        // Commit and push:
        await exec.exec("git", ["add", "--all"]);
        await exec.exec("git", ["commit", "-am", `Update version to ${target_version}`]);
        await exec.exec("git", ["push", "origin", `HEAD:${target_branch}`]);

    } catch (error) {
        core.setFailed(error.message);
    }
}

// Run main function:

main();
