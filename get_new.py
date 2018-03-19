import praw, prawcore
from datetime import datetime
import utils

posts = {}

utils.restore(posts)

print(posts)

reddit = praw.Reddit(store_json_result=True)

subreddit = reddit.subreddit('ethtrader+ethereum')

for post in subreddit.stream.submissions():
    date = str(datetime.fromtimestamp(post.created_utc).date())

    if date not in posts:
        posts[date] = {}

    posts[date][post.id] = {
        'id': post.id,
        'subreddit': post.subreddit_name_prefixed,
        'created_utc': post.created_utc,
        'title': post.title,
        'text': post.selftext,
        'url': post.url,
        'author': post.author.name if post.author is not None else None,
        'permalink': post.permalink
    }

    utils.save(posts)
