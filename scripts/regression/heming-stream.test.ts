// The removed service streaming path must not silently return in offline mode.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const file of ['app/heming/page.tsx','components/InsightPanel.tsx','components/ChatPanel.tsx']) {
 const text=readFileSync(file,'utf8');
 assert(!/fetch\s*\(/.test(text),file+' must not send chart data');
 assert(!/new (?:Anthropic|OpenAI)|generativelanguage|api\.anthropic/.test(text));
}
const pkg=JSON.parse(readFileSync('package.json','utf8'));
assert(!pkg.dependencies['@anthropic-ai/sdk']);
console.log('Legacy pages: no inference requests or inference SDK');
