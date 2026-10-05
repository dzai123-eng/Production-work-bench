(function(){
  function callRpc(method,args,ok,fail){
    fetch('/api/rpc/'+encodeURIComponent(method),{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({args:Array.from(args||[])})
    }).then(async function(res){
      var payload={};
      try{ payload=await res.json(); }catch(e){ payload={error:'Invalid server response'}; }
      if(!res.ok || payload.ok===false) throw new Error(payload.error||('HTTP '+res.status));
      return payload.result;
    }).then(function(result){ if(typeof ok==='function') ok(result); })
      .catch(function(err){ if(typeof fail==='function') fail(err); else console.error(err); });
  }
  function runner(success,failure){
    return new Proxy({}, {
      get:function(_,prop){
        if(prop==='withSuccessHandler') return function(fn){ return runner(fn,failure); };
        if(prop==='withFailureHandler') return function(fn){ return runner(success,fn); };
        if(prop==='then') return undefined;
        return function(){ callRpc(String(prop),arguments,success,failure); };
      }
    });
  }
  window.google=window.google||{};
  window.google.script=window.google.script||{};
  Object.defineProperty(window.google.script,'run',{get:function(){return runner(null,null);}});
})();
