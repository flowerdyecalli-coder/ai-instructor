import {collect} from './collector.mjs';
export default {async fetch(request,env){
 const origin=request.headers.get('Origin');
 const allowed=env.ALLOWED_ORIGIN;
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
 if(origin&&origin===allowed)headers['Access-Control-Allow-Origin']=origin;
 if(origin&&origin!==allowed)return new Response(JSON.stringify({error:'허용되지 않은 사이트입니다.'}),{status:403,headers});
 if(request.method!=='GET')return new Response('{}',{status:405,headers});
 if(new URL(request.url).pathname!=='/jobs')return new Response('{}',{status:404,headers});
 try{return new Response(JSON.stringify(await collect(env)),{headers});}
 catch(e){return new Response(JSON.stringify({error:e.message}),{status:502,headers});}
}};
