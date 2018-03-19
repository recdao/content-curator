import json
import os

def save(posts):
    for date in posts:
        posts_file = open("posts/" + date + '.json', "w")
        posts_file.write( json.dumps(posts[date]) )
        posts_file.close()

def restore(posts):
    files = os.listdir("posts")
    dates = [x.split(".")[0] for x in files]
    print(dates)
    for date in dates:
        posts[date] = json.load( open("posts/" + date + '.json') )
