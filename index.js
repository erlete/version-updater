const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require('fs');

const main = async () => {
    try {
        // Retrieve inputs:
        const git_email = core.getInput('git-email');
        const git_name = core.getInput('git-name');
        let target_version = core.getInput('target-version');
        const target_file = core.getInput('target-file');
        const target_branch = core.getInput('target-branch');

        // Format tag:
        target_version = target_version.replace(/^refs\/tags\/v/, '');

        // Load, update and save metadata from file:
        let metadata = fs.readFileSync(target_file, 'utf8');
        metadata = metadata.replace(/\"version\":(\s*)\"(.*)\"/, `"version": "${target_version}"`);
        fs.writeFileSync(target_file, metadata, 'utf8');

        // Configure git:
        await exec.exec('git', ['config', '--global', 'user.email', git_email]);
        await exec.exec('git', ['config', '--global', 'user.name', git_name]);

        // Commit and push:
        await exec.exec('git', ['commit', target_file, '-m', `Update version to ${target_version}`]);
        await exec.exec('git', ['push', 'origin', `HEAD:${target_branch}`]);

    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
