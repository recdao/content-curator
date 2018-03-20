from datetime import datetime
import json
import os

def save(posts, post):
    date = str(datetime.fromtimestamp(post["created_utc"]).date())

    if date not in posts:
        posts[date] = {}

    is_new = False
    if post["id"] not in posts[date]:
        is_new = True

    posts[date][post["id"]] = post

    # update archive first
    posts_file = open("static/posts/archive/" + date + '.json', "w")
    posts_file.write( json.dumps(posts[date]) )
    posts_file.close()

    if is_new:
        # is new, add to queue for broadcast
        posts_file = open("static/posts/" + post["id"] + '.json', "w")
        posts_file.write( json.dumps(post) )
        posts_file.close()


def restore(posts):
    files = os.listdir("static/posts/archive")
    dates = [x.split(".")[0] for x in files]
    for date in dates:
        posts[date] = json.load( open("static/posts/archive/" + date + '.json') )
