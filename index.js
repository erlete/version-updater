const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

try {
    const git_email = core.getInput('git-email');
    const git_username = core.getInput('git-username');
    const target_version = core.getInput('target-version');
    const metadata_file = core.getInput('metadata-file');

    console.log(`Target version: ${target_version}`);
    console.log(`Setting version to a default 'refs/tags/v1.2.3' for debugging purposes`);
    target_version = 'refs/tags/v1.2.3';
    target_version = target_version.replace(/^refs\/tags\/v/, '');
    console.log(`Target version without prefix: ${target_version}`);
    console.log(`Username: ${git_username}. Email: ${git_email}`);

    // open the metadata file and load its contents into a string

    const metadata = fs.readFileSync(metadata_file, 'utf8');
    console.log(`Metadata file contents: ${metadata}`);

    // replace the match for the \"version\":(\s*)\"(.*)\" expression with \"version\": \"{target_version}\"
    metadata = metadata.replace(/\"version\":(\s*)\"(.*)\"/, `"version": "${target_version}"`);
    console.log(`Metadata file contents after replacement: ${metadata}`);
    // write the new contents to the metadata file
    fs.writeFileSync(metadata_file, metadata, 'utf8');

    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload.ref}`);

} catch (error) {
    core.setFailed(error.message);
}
