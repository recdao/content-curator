const Hapi = require('hapi');
const Nes = require('nes');
const Path = require('path');
const Promise = require('bluebird');
const Inert = require('inert');
const chokidar = require('chokidar');
const fs = Promise.promisifyAll(require("fs"));

const watcher = chokidar.watch("static/posts", { persistent: true, depth: 0 });

const server = new Hapi.Server({
  port: 3000,
  routes: {
      files: {
          relativeTo: Path.join(__dirname, 'static')
      }
  }
});

const start = async () => {
  await server.register(Inert);
  await server.register(Nes);

  // server.route({
  //   method: 'GET',
  //   path: '/',
  //   handler: (request, h) => "<div id='app'></div><script src='app.js'></script>"
  // });

  server.route({
      method: 'GET',
      path: '/{param*}',
      handler: {
          directory: {
              path: '.',
              redirectToSlash: true,
              index: true,
          }
      }
  });

  await server.start();

  console.log('Server running at:', server.info.uri);

  watcher.on("add", sendPost);

};

start();

async function sendPost(file, retry) {
  retry = retry || 0;
  let contents;
  try {
    console.log(`added: ${file}`);
    contents = await fs.readFileAsync(file);
    console.log(contents);
    server.broadcast( JSON.parse(contents) );
    await fs.unlinkAsync(file);
    console.log(`removed: ${file}`);
  } catch(err) {
    console.log(contents)
    if(retry < 5) {
      await Promise.delay(2000);
      return await sendPost(file, ++retry);
    }
    console.warn(err); // TypeError: failed to fetch
  }
}
