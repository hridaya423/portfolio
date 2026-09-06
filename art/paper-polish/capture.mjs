import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const [width = '1490', destination = 'comparison', route = '/review/experience'] = process.argv.slice(2);
const targets = await (await fetch('http://localhost:9337/json')).json();
const socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, {once:true}));
let sequence = 0;
const pending = new Map();
socket.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  const reply = pending.get(message.id);
  if (reply) {
    pending.delete(message.id);
    if (message.error) reply.reject(message.error);
    else reply.resolve(message.result);
  }
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, {resolve, reject});
    socket.send(JSON.stringify({id, method, params}));
  });
}
await send('Emulation.setDeviceMetricsOverride', {width:Number(width),height:1055,deviceScaleFactor:1,mobile:false});
await send('Page.navigate', {url:`http://localhost:3010${route}`});
await new Promise(resolve => setTimeout(resolve, 1200));
await send('Runtime.evaluate', {expression:'document.fonts.ready',awaitPromise:true});
const metrics = await send('Runtime.evaluate', {expression:'JSON.stringify({width:innerWidth,scroll:document.documentElement.scrollWidth})',returnByValue:true});
const {width: viewport, scroll} = JSON.parse(metrics.result.value);
assert.equal(viewport, Number(width));
assert(scroll <= viewport, `Overflow: ${scroll} > ${viewport}`);
const screenshot = await send('Page.captureScreenshot', {format:'png',captureBeyondViewport:false});
await writeFile(new URL(`${destination}.png`, import.meta.url), Buffer.from(screenshot.data, 'base64'));
socket.close();
console.log(`${destination}: ${width}px, no horizontal overflow`);
