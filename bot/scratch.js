const snoowrap = require('snoowrap');
const secret = require("../.secret");
const r = new snoowrap(secret.reddit);

r.getSubmission("88yb6x").subreddit.display_name.then(console.log);
