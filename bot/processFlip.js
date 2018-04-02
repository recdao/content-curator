const Promise = require("bluebird");
const pgp = require("pg-promise")({promiseLib: Promise});
const bases = require("bases");
const snoowrap = require('snoowrap');
const Web3 = require("web3");
const secret = require("../.secret");
const db = pgp(`postgres://postgres:${secret.db.password}@localhost:5432/reddit`);
const providerUrl = require('../config').providerUrl;
const r = new snoowrap(secret.reddit);
const initWeb3 = require("./initWeb3");

module.exports = async function processFlip(flip){
  let {returnValues}= flip;
  let eventId = flip.id;
  let {id} = returnValues;
  let postId = bases.toBase36(parseInt(id));

  let flips = await db.any("SELECT * FROM flips WHERE reddit_id = $1", [postId]);
  let known = flips.find(f=>f.reddit_id===postId);
  // let res = await db.any("SELECT * FROM flips WHERE event_id = $1", [eventId]);
  if(!known) {
    let tx = await getTx(flip.transactionHash);
    await db.none("INSERT INTO flips(event_id, reddit_id) VALUES($1, $2)", [eventId, postId]);
  } else if (known.reply_id){
    // already processed this flip
    return;
  }
  let replied = flips.find(f=>f.reply_id);
  let replyId;
  if(replied) replyId = replied.reply_id;
  return await sendReply(postId, eventId, replyId);
}

async function getTx(hash, retry){
  retry = retry || 0;
  try {
    return await web3.eth.getTransaction(hash);
  } catch (err) {
    if(retry > 5) throw err;
    console.log("retry", ++retry)
    initWeb3.reset();
    return await getTx(hash, retry);
  }
}

async function sendReply(postId, eventId, replyId){
  const ContentDAO = initWeb3.contracts.ContentDAO;
  let post = await ContentDAO.methods.getPost(bases.fromBase36(postId)).call();
  // do send
  // console.log(postId, eventId, replyId)
  // let reply = await genReply(postId);
  // console.log(reply);
  // return;

  let id, comment;
  try {
    let reply = await genReply(post);
    let rPost = await r.getSubmission(postId)[post.liked ? "approve" : "remove"]();

    if(replyId) {
      comment = await r.getComment(replyId).edit(reply);
      console.log(`edited reply ${comment.id} to POST:${postId}`);
    } else {
      comment = await rPost.reply(reply);
      console.log(`sent reply ${comment.id} to POST:${postId}`);
    }
    id = comment.id;
  } catch (err) {
    if(err.message.indexOf("TOO_OLD") !== -1) id = "TOO_OLD";
    else console.warn(err);
  }
  return await db.none("UPDATE flips SET reply_id = $1 WHERE event_id = $2", [id, eventId]);
}

async function genReply(post){
  let total = {true: post.totalUp, false: post.totalDown};
  let toFlip = 2*total[post.liked] - total[!post.liked];
  return `This post has been ${post.liked ? "approved" : "removed"} by the r/recdao [content curator](http://curator.recdao.org:3000). Stake ${toFlip/Math.pow(10,9)} REC to ${post.liked ? "remove" : "approve"} it.`;
}
