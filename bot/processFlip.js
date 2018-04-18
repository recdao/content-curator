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
const moment = require("moment");
const removalDelayMinutes = 60;
const canRemoveFrom = ["ethtrader"];

setInterval(doRemovals, 60000);
doRemovals();

async function doRemovals(){
  let toRemove = await db.any("SELECT * FROM flips WHERE remove_at < $1", [moment()]);
  console.log(`${toRemove.length} to remove`);
  await Promise.mapSeries(toRemove, removePost);
}

async function removePost(flip){
  let post = await getPost(flip.reddit_id);
  // double check current state
  if(!post.liked) {
    let subreddit = await r.getSubmission(flip.reddit_id).subreddit.display_name;
    if(canRemoveFrom.includes(subreddit)) {
      await r.getSubmission(flip.reddit_id).remove();
      console.log(`removed POST:${flip.reddit_id}`);
    }
  }
  return await db.none("UPDATE flips SET remove_at = NULL WHERE id = $1", [flip.id]);
}

module.exports = async function processFlip(flip){
  let {returnValues}= flip;
  let eventId = flip.id;
  let {id} = returnValues;
  let postId = bases.toBase36(parseInt(id));

  let flips = await db.any("SELECT * FROM flips WHERE reddit_id = $1", [postId]);
  let known = flips.find(f=>f.event_id===eventId);
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
  return await sendReply(postId, eventId, replyId, flips);
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

async function getPost(postId, retry){
  retry = retry || 0;
  try {
    const ContentDAO = initWeb3.contracts.ContentDAO;
    return await ContentDAO.methods.getPost(bases.fromBase36(postId)).call();
  } catch (err) {
    if(retry > 5) throw err;
    console.log("retry", ++retry)
    initWeb3.reset();
    return await getPost(postId, retry);
  }
}

async function sendReply(postId, eventId, replyId, previous){
  let post = await getPost(postId);
  // do send
  // console.log(postId, eventId, replyId)
  // let reply = await genReply(postId);
  // console.log(reply);
  // return;

  let id, comment;
  try {
    let reply = await genReply(post, postId);
    // console.log(reply)
    if(post.liked) await r.getSubmission(postId).approve();

    if(replyId) {
      comment = await r.getComment(replyId).edit(reply);
      console.log(`edited reply ${replyId} to POST:${postId}`);
    } else {
      comment = await r.getSubmission(postId).reply(reply);
      await comment.distinguish();
      console.log(`sent reply ${comment.id} to POST:${postId}`);
    }
    id = replyId || comment.id;
  } catch (err) {
    if(err.message.indexOf("TOO_OLD") !== -1) id = "TOO_OLD";
    else if(err.message.indexOf("Forbidden")) {
      id = "403";
      console.warn(`403 post:${postId}`)
    } else console.warn(err);
  }
  if(previous && post.liked) await db.none("UPDATE flips SET remove_at = NULL WHERE reddit_id = $1", [postId]);
  return await db.none("UPDATE flips SET reply_id = $1, remove_at = $2 WHERE event_id = $3", [id, post.liked ? null : moment().add(removalDelayMinutes, 'minutes'), eventId]);
}

async function genReply(post, postId){
  let total = {true: post.totalUp, false: post.totalDown};
  let toFlip = 2*total[post.liked] - total[!post.liked];
  if(post.liked) return `This post has received a support stake via the r/recdao [content curator](http://curator.recdao.org:3000). If it's spam, please [stake](http://curator.recdao.org:3000) ${toFlip/Math.pow(10,9)} [REC](https://www.reddit.com/r/recdao/comments/83wdeq/faq/) to reverse this position and trigger removal.`;
  let subreddit = await r.getSubmission("88yb6x").subreddit.display_name;
  if(canRemoveFrom.includes(subreddit)) return `Someone has flagged this post as spam. It will be removed in ${removalDelayMinutes/60} hour. [Stake](http://curator.recdao.org:3000) ${toFlip/Math.pow(10,9)} [REC](https://www.reddit.com/r/recdao/comments/83wdeq/faq/) to reverse this position.` ;
  return `Someone has flagged this post as spam. If it's not please [stake](http://curator.recdao.org:3000) ${toFlip/Math.pow(10,9)} [REC](https://www.reddit.com/r/recdao/comments/83wdeq/faq/) to support it. On ${canRemoveFrom.map(s=>('r/'+s).join(' and '))} this post would be removed in ${removalDelayMinutes/60} hour` ;

}
