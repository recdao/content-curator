import praw, prawcore
import utils

posts = {}

utils.restore(posts)

reddit = praw.Reddit(store_json_result=True)

# subreddit = reddit.subreddit("ethtrader+ethereum")
subreddit = reddit.subreddit("ethtrader_test")

def start():
    for post in subreddit.stream.submissions():
        post = {
            "id": post.id,
            "subreddit": post.subreddit_name_prefixed,
            "created_utc": post.created_utc,
            "title": post.title,
            "text": post.selftext,
            "url": post.url,
            "author": post.author.name if post.author is not None else None,
            "permalink": post.permalink
        }

        print(post["id"])

        utils.save(posts, post)

if __name__ == "__main__":
    start();
