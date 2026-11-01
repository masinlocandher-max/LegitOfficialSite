import test from 'node:test';
import assert from 'node:assert/strict';
import {destination,handle,TARGET} from './redirect.mjs';
test('both acquisition hosts permanently redirect all campaign paths to the product',()=>{
 for(const scheme of ['http','https']) for(const host of ['legitofficialsite.com','www.legitofficialsite.com']) for(const path of ['/','/campaign','/old/path']) for(const method of ['GET','HEAD']) {
  const response=handle(new Request(`${scheme}://${host}${path}`,{method}));
  assert.equal(response.status,308); assert.equal(response.headers.get('location'),TARGET);
 }
});
test('only bounded campaign tags survive; visitor secrets and redirect targets never transfer',()=>{
 const url=destination('https://legitofficialsite.com/?utm_source=instagram&utm_campaign=own+your+space&email=private@example.com&token=secret&url=https://evil.test');
 assert.equal(url,TARGET+'?utm_source=instagram&utm_campaign=own+your+space');
 assert.equal(destination('https://legitofficialsite.com/?utm_source='+('x'.repeat(201))),TARGET);
 assert.equal(destination('https://legitofficialsite.com/?utm_medium=%0d%0aLocation:evil'),TARGET);
});
test('customer subdomains and non-browser submissions are never redirected',()=>{
 for(const host of ['mara.legitofficialsite.com','business.legitofficialsite.com','legitofficialsite.com.evil.test','other.test']) {
  assert.equal(destination('https://'+host),null);
  assert.equal(handle(new Request('https://'+host)).status,404);
 }
 assert.equal(handle(new Request('https://legitofficialsite.com/',{method:'POST',body:'private content'})).status,405);
});
