const http=require('http');
const fs=require('fs');
const path=require('path');
const {URL}=require('url');
const ROOT=__dirname, PUBLIC=path.join(ROOT,'public'), DATA=path.join(ROOT,'data');
const stateFile=path.join(DATA,'app-state.json'), dashboardFile=path.join(DATA,'dashboard.json');
const PORT=Number(process.env.PORT||8787);
function readJson(file,fallback){try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){return fallback;}}
function saveJson(file,value){fs.writeFileSync(file,JSON.stringify(value,null,2));}
function state(){return readJson(stateFile,{settings:{},mailTasks:[],routingWork:{},routingDetails:{},routingDone:{},componentDone:{}});}
function mutate(fn){const s=state();const out=fn(s);saveJson(stateFile,s);return out;}
function now(){return new Date().toLocaleString('en-GB',{timeZone:'Asia/Singapore',hour12:false});}
function bodyClass(page){return page==='action'?'action-workbench-mode':page==='routing'?'routing-workbench-mode':page==='workbench'?'task-workbench-mode':page==='component'?'component-workbench-mode':page==='chat'?'chat-workbench-mode':'';}
function demoDashboard(){const d=readJson(dashboardFile,{configured:false,rows:[],productionRows:[],changeHistory:[],summary:{}});d.lastSync=now();d.settings=state().settings||{};return d;}
function mailInbox(){const s=state();return {configured:!!(s.settings&&s.settings.mailTasksUrl),tasks:s.mailTasks||[],sheetName:s.settings.mailTasksTab||'Mail Tasks',spreadsheetName:'Standalone Store',loadedAt:now(),pulse:String((s.mailTasks||[]).length),message:''};}
function routingState(sn){const s=state();return (s.routingWork||{})[String(sn)]||{sn:String(sn||''),status:'NOT STARTED',startedAt:'',completedAt:'',events:[]};}
const rpc={
 getSettings:()=>state().settings||{},
 saveSettings:(settings)=>mutate(s=>{s.settings={...(s.settings||{}),...(settings||{})};return s.settings;}),
 testConnections:(settings)=>({ok:true,planner:'Standalone adapter pending',engineer:'Standalone adapter pending',production:'Standalone adapter pending',ftz:'Standalone adapter pending',mailTasks:'Standalone local store',chat:'Standalone local store',component:'Standalone local store'}),
 getDashboardData:()=>demoDashboard(),
 resetChangeHistoryBaseline:()=>({ok:true,message:'Standalone baseline kept. Live history adapter not enabled yet.'}),
 getChangeHistoryPage:()=>({items:[],total:0}),
 getWebAppUrl:()=>process.env.PUBLIC_BASE_URL||`http://localhost:${PORT}/`,
 getMailTaskInbox:()=>mailInbox(),
 getMailTaskInboxPulse:()=>({configured:mailInbox().configured,pulse:String(mailInbox().tasks.length),lastRow:mailInbox().tasks.length+1,checkedAt:now()}),
 setMailTaskStatus:(ref,status)=>mutate(s=>{const tasks=s.mailTasks||[];const t=tasks.find(x=>Number(x.rowNumber)===Number(ref&&ref.rowNumber));if(t)t.status=String(status||'NEW').toUpperCase();return mailInbox();}),
 getMailTaskOriginalEmail:()=>({ok:true,subject:'Standalone mode',from:'',to:'',cc:'',date:now(),body:'Gmail live adapter is not connected in V1.',htmlBody:'<p>Gmail live adapter is not connected in V1.</p>',attachments:[],inlineImages:[],permalink:''}),
 replyToMailTask:()=>{throw new Error('Gmail send is not connected in standalone V1.');},
 replyToMailTaskWithAttachments:()=>{throw new Error('Gmail send is not connected in standalone V1.');},
 getRoutingEmailRequests:(sn)=>({sn:String(sn||''),requests:[],phaseSummary:{prelist:null,final:null},message:'Gmail adapter not connected.'}),
 getRoutingEmailRequestsForGroup:(sns)=>({sns:Array.isArray(sns)?sns:[],requests:[],phaseSummary:{prelist:null,final:null},message:'Gmail adapter not connected.'}),
 getRoutingOriginalEmail:()=>({ok:true,subject:'Standalone mode',from:'',to:'',cc:'',date:now(),body:'Gmail adapter not connected.',htmlBody:'<p>Gmail adapter not connected.</p>',attachments:[],inlineImages:[],ocrIds:[],finalBodyIds:[],ocrEvidence:[],permalink:''}),
 getRoutingWorkState:(sn)=>routingState(sn),
 startRoutingWork:(sn)=>mutate(s=>{const key=String(sn||'');const r=(s.routingWork[key]||{sn:key,events:[]});r.status='IN PROGRESS';r.startedAt=now();r.events.unshift({time:r.startedAt,action:'START',user:'Standalone user'});s.routingWork[key]=r;return r;}),
 completeRoutingWork:(sn)=>mutate(s=>{const key=String(sn||'');const r=(s.routingWork[key]||{sn:key,events:[]});r.status='COMPLETED';r.completedAt=now();r.events.unshift({time:r.completedAt,action:'COMPLETE',user:'Standalone user'});s.routingWork[key]=r;return r;}),
 getRoutingWorkDetails:(key)=>{const s=state();return (s.routingDetails||{})[String(key)]||{__phaseDone:{}};},
 saveRoutingWorkDetail:(p)=>mutate(s=>{const k=String((p||{}).groupKey||'');s.routingDetails[k]=s.routingDetails[k]||{__phaseDone:{}};s.routingDetails[k][String(p.part||'')]=p;return {ok:true};}),
 saveRoutingWorkDone:(p)=>mutate(s=>{const k=String((p||{}).groupKey||''),ph=String((p||{}).phase||'').toUpperCase();s.routingDetails[k]=s.routingDetails[k]||{__phaseDone:{}};s.routingDetails[k].__phaseDone=s.routingDetails[k].__phaseDone||{};s.routingDetails[k].__phaseDone[ph]={done:!!p.done,updatedAt:now()};return {ok:true,updatedAt:now()};}),
 getRoutingSetupStatusMap:(groups)=>Object.fromEntries((groups||[]).map(g=>[g.key,{prelist:null,final:null}])),
 getRoutingQueuePhaseStatusMap:(groups)=>Object.fromEntries((groups||[]).map(g=>[g.key,{prelist:null,final:null}])),
 getVaultDrawingLinksForParts:(parts)=>Object.fromEntries((parts||[]).map(p=>[String(p).toUpperCase(),null])),
 saveVaultDrawingLinks:()=>({ok:true}),
 getVaultDrawingLinksSheetInfo:()=>({url:''}),
 getComponentAllocationState:()=>{const s=state();return {configured:!!(s.settings&&s.settings.componentAllocationUrl),done:s.componentDone||{},doneItems:Object.values(s.componentDone||{})};},
 openComponentAllocationTab:(p)=>({created:false,tabName:String((p||{}).sn||'Allocation'),url:''}),
 completeComponentAllocation:(p)=>mutate(s=>{const k=String((p||{}).cycleKey||(p||{}).sn||Date.now());s.componentDone[k]={...p,key:k,completedAt:now()};return {configured:true,done:s.componentDone,doneItems:Object.values(s.componentDone)};}),
 getChatMirror:()=>({configured:false,messages:[],loadedAt:now(),pulse:''}),
 getChatMirrorPulse:()=>({configured:false,pulse:'',checkedAt:now()})
};
function sendJson(res,status,obj){const b=Buffer.from(JSON.stringify(obj));res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Content-Length':b.length,'Cache-Control':'no-store'});res.end(b);}
function contentType(file){return file.endsWith('.js')?'application/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream';}
function serveFile(res,file){if(!fs.existsSync(file)){res.writeHead(404);return res.end('Not found');}const b=fs.readFileSync(file);res.writeHead(200,{'Content-Type':contentType(file),'Content-Length':b.length});res.end(b);}
const server=http.createServer((req,res)=>{
  const u=new URL(req.url,`http://${req.headers.host||'localhost'}`);
  if(req.method==='POST'&&u.pathname.startsWith('/api/rpc/')){
    let raw='';req.on('data',c=>{raw+=c;if(raw.length>12*1024*1024)req.destroy();});req.on('end',()=>{try{const method=decodeURIComponent(u.pathname.slice('/api/rpc/'.length));const h=rpc[method];if(!h)return sendJson(res,404,{ok:false,error:`RPC not migrated yet: ${method}`});const payload=raw?JSON.parse(raw):{};Promise.resolve(h(...(payload.args||[]))).then(result=>sendJson(res,200,{ok:true,result})).catch(e=>sendJson(res,500,{ok:false,error:e.message||String(e)}));}catch(e){sendJson(res,400,{ok:false,error:e.message||String(e)});}});return;
  }
  if(req.method==='GET'&&u.pathname==='/health')return sendJson(res,200,{ok:true,app:'Production Workbench Standalone V1',time:now()});
  if(req.method==='GET'&&(u.pathname==='/'||u.pathname==='/index.html')){
    let html=fs.readFileSync(path.join(PUBLIC,'index.template.html'),'utf8');const page=String(u.searchParams.get('page')||'monitor').toLowerCase();const valid=['monitor','action','workbench','routing','component','chat'];const p=valid.includes(page)?page:'monitor';const sn=String(u.searchParams.get('sn')||'');html=html.replace('__INITIAL_BODY_CLASS__',bodyClass(p)).replace('__INITIAL_PAGE_JSON__',JSON.stringify(p)).replace('__INITIAL_SN_JSON__',JSON.stringify(sn));const b=Buffer.from(html);res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Length':b.length,'Cache-Control':'no-store'});return res.end(b);
  }
  if(req.method==='GET'){
    const rel=u.pathname.replace(/^\/+/,''),file=path.resolve(PUBLIC,rel);if(file.startsWith(PUBLIC))return serveFile(res,file);
  }
  res.writeHead(404);res.end('Not found');
});
server.listen(PORT,'0.0.0.0',()=>console.log(`Production Workbench Standalone V1: http://localhost:${PORT}`));
