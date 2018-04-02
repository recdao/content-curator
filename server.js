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

async function sendPost(file, stats, retry) {
  retry = retry || 0;
  console.log(`added: ${file}`, retry);
  let contents;
  try {
    contents = await fs.readFileAsync(file);
  } catch(err){
    return console.warn("read file error", err);
  }
  let json;
  try {
    json = JSON.parse(contents);
  } catch(err){
    if(retry < 5){
      await Promise.delay(2000);
      return await sendPost(file, stats, ++retry);
    }
    return console.warn("json parse error", err);
  }
  server.broadcast( json );
  try {
    await fs.unlinkAsync(file);
  } catch(err){
    return console.warn("unlink file error", err);
  }
  console.log(`removed: ${file}`);


  // try {
  //   contents
  //   console.log(contents);
  //   server.broadcast( JSON.parse(contents) );
  //   await fs.unlinkAsync(file);
  //   console.log(`removed: ${file}`);
  // } catch(err) {
  //   console.log(contents)
  //   if(retry < 5) {
  //     await Promise.delay(2000);
  //     return await sendPost(file, ++retry);
  //   }
  //   console.warn(err); // TypeError: failed to fetch
  // }
}
