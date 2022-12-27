const core = require('@actions/core');
const github = require('@actions/github');

try {

    const git_email = core.getInput('git-email');
    const git_username = core.getInput('git-username');
    console.log(`Username: ${git_username}. Email: ${git_email}`);

    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);

    const time = (new Date()).toTimeString();
    core.setOutput("time", time);

} catch (error) {
    core.setFailed(error.message);
}
