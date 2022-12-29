const core = require("@actions/core");
const exec = require("@actions/exec");
const fs = require("fs");


const REGEXPRS = {
    "tag-format": /v(([0-9]+(\.?))+)/,
    "package.json": /"version"(\s*):(\s*)"(([0-9]+(\.?))+)"/,
    "pyproject.toml": /version(\s*)=(\s*)("?)(([0-9]+(\.?))+)("?)/
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

async function updatePackageJson(tag) {
    const filename = "package.json";

    // Update package.json version:
    updateFile(filename, `"version": "${tag}"`);

    // Update package-lock.json version:
    await exec.exec("npm", ["install"]);
}

async function updatePyProjectToml(tag) {
    const filename = "pyproject.toml";

    // Update pyproject.toml version:
    updateFile(filename, `version = "${tag}"`);
}

function ensureReleaseEvent(event_name, event_type) {
    if (event_name !== "release") {
        throw new Error(`The "${event_name}" event is not supported. Only "release" events are.`);
    }
    if (event_type !== "published") {
        throw new Error(`The "${event_type}" release event is not supported. Only "published" release events are.`);
    }
}

function ensureValidTag(ref_type, ref_name, ref_protected) {
    if (ref_type !== "tag") {
        throw new Error(`Reference type "${ref_type}" does not refer to a release. Only "tag" reference types are supported.`);
    }
    if (!ref_name.match(REGEXPRS["tag-format"])) {
        throw new Error(`Reference name "${ref_name}" does not match regular expression /${REGEXPRS["tag-format"]}/.`);
    }
    if (ref_protected !== "false") {
        throw new Error(`The reference is protected. Only unprotected references are supported.`);
    }
}

const main = async () => {
    try {
        // Relevant metadata definition:
        const payload = github.context.payload;
        const metadata = {
            "author": process.env.GITHUB_TRIGGERING_ACTOR,
            "branch": payload.release.target_commitish,
            "repository": process.env.GITHUB_REPOSITORY,
            "token": process.env.GITHUB_TOKEN,
            "event_name": process.env.GITHUB_EVENT_NAME,
            "event_type": payload.action,
            "ref_name":process.env.GITHUB_REF_NAME,
            "ref_type": process.env.GITHUB_REF_TYPE,
            "ref_protection": process.env.GITHUB_REF_PROTECTED,
            "release_name": payload.release.name,
        };

        // Validate conditions:
        ensureReleaseEvent(metadata.event_name, metadata.event_type);
        ensureValidTag(metadata.ref_type, metadata.ref_name, metadata.ref_protection);

        // Extract numeric format tag:
        const tag = metadata.ref_name.substring(1);

        // Retrieve inputs:
        const git_email = core.getInput("git-email");
        const git_name = core.getInput("git-name");
        const target_file = core.getInput("target-file");

        // Ensure file exists:
        ensureFileExists(target_file);

        // Update project file:
        switch (target_file) {
            case "package.json":
                updatePackageJson(tag);
                break;
            case "pyproject.toml":
                updatePyProjectToml(tag);
                break;
            default:
                throw new Error(`Unsupported file: ${target_file}`);
        }

        // Set remote repository with token access:
        const remote = `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`;

        // Configure git:
        await exec.exec("git", ["config", "user.email", git_email]);
        await exec.exec("git", ["config", "user.name", git_name]);

        // Commit and push:
        await exec.exec("git", ["add", "--all"]);
        await exec.exec("git", ["commit", "-am", `Update version to ${tag}`]);
        await exec.exec('git', ['push', remote, `HEAD:${metadata.branch}`, '--force']);

    } catch (error) {
        core.setFailed(error.message);
    }
}

// Run main function:

main();
