const core = require('@actions/core');
const github = require('@actions/github');
const exec = require('@actions/exec');
const fs = require('fs');

const main = async () => {
    try {
        const git_email = core.getInput('git-email');
        const git_username = core.getInput('git-username');
        let target_version = core.getInput('target-version');
        const target_file = core.getInput('target-file');
        const target_branch = core.getInput('target-branch');

        // generate three random numbers from 0-9
        const random1 = Math.floor(Math.random() * 10);
        const random2 = Math.floor(Math.random() * 10);
        const random3 = Math.floor(Math.random() * 10);

        console.log(`Target version: ${target_version}`);
        target_version = `refs/tags/v${random1}.${random2}.${random3}`;
        console.log(`Setting version to a default '${target_version}' for debugging purposes`);
        target_version = target_version.replace(/^refs\/tags\/v/, '');
        console.log(`Target version without prefix: ${target_version}`);
        console.log(`Username: ${git_username}. Email: ${git_email}`);

        // open the metadata file and load its contents into a string

        let metadata = fs.readFileSync(target_file, 'utf8');
        console.log(`Metadata file contents: ${metadata}`);

        // replace the match for the \"version\":(\s*)\"(.*)\" expression with \"version\": \"{target_version}\"
        metadata = metadata.replace(/\"version\":(\s*)\"(.*)\"/, `"version": "${target_version}"`);
        console.log(`Metadata file contents after replacement: ${metadata}`);
        // write the new contents to the metadata file
        fs.writeFileSync(target_file, metadata, 'utf8');

        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2)

        await exec.exec('git', ['config', '--global', 'user.email', git_email]);
        await exec.exec('git', ['config', '--global', 'user.name', git_username]);

        await exec.exec('git', ['commit', target_file, '-m', `Update version to ${target_version}`]);
        await exec.exec('git', ['push', 'origin', `HEAD:${target_branch}`]);

    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
