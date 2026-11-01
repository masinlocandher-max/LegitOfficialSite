import test from 'node:test';
import assert from 'node:assert/strict';
import {destination,handle,TARGET} from '../redirect.mjs';
test('personal data and token-shaped values are rejected inside UTM labels',()=>{
 for(const value of ['person@example.com','https://private.test','09175551234','+639175551234','eyJhbGciOiJIUzI1NiJ9.payload.signature','a'.repeat(32),'name%40email.test'])
  assert.equal(destination('https://legitofficialsite.com/?utm_source='+encodeURIComponent(value),{utm_source:[value]}),TARGET);
 assert.equal(destination('https://legitofficialsite.com/?utm_source=one&utm_source=two'),TARGET);
});
test('malformed URLs, credentials, other protocols and ports never redirect',()=>{
 for(const url of ['bad url','ftp://legitofficialsite.com','https://user:pass@legitofficialsite.com','https://legitofficialsite.com:8443','https://www.senzpr.com/legit-official-site/'])assert.equal(destination(url),null);
});
test('unsupported methods cannot forward submitted content and HEAD is bodyless',async()=>{
 for(const method of ['POST','PUT','PATCH','DELETE','OPTIONS']){
  const response=handle(new Request('https://legitofficialsite.com/',{method}));
  assert.equal(response.status,405);assert.equal(response.headers.get('allow'),'GET, HEAD');assert.equal(response.headers.get('location'),null);
 }
 for(const host of ['legitofficialsite.com','customer.legitofficialsite.com'])assert.equal(await handle(new Request('https://'+host,{method:'HEAD'})).text(),'');
});

test('campaign parameters require an explicitly approved value',()=>{assert.equal(destination('https://legitofficialsite.com/?utm_source=John+Smith'),TARGET);assert.equal(destination('https://legitofficialsite.com/?utm_source=instagram',{utm_source:['instagram']}),TARGET+'?utm_source=instagram');});
