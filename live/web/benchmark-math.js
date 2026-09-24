(function(root){
 const cache=s=>{const c=s.cache,den=c?c.input+c.read+c.write:0;return {readShare:den>0?c.read/den*100:null,responseHitShare:c?.samples?c.readResponses/c.samples*100:null,readSavings:c?.readSavings?.samples?c.readSavings.sum:null,netSavings:c?.netSavings?.samples?c.netSavings.sum:null}};
 const reduction=(baseline,current)=>Number.isFinite(baseline)&&baseline>0&&Number.isFinite(current)?(baseline-current)/baseline*100:null;
 const comparable=(a,b,confirmed)=>!!(confirmed&&a&&b&&a.id!==b.id&&a.projectId===b.projectId&&a.source===b.source&&!a.truncated&&!b.truncated&&!a.transportDropped&&!b.transportDropped&&JSON.stringify(Object.keys(a.models).sort())===JSON.stringify(Object.keys(b.models).sort()));
 root.GentleBenchmarkMath={cache,reduction,comparable};
})(globalThis);
