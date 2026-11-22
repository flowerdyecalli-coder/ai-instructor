export const queries=['AI 강사 모집','생성형 AI 강사 채용','챗GPT 강사 모집','디지털배움터 강사 모집','스마트폰 강사 모집'];
const clean=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
export function parse(item,now=new Date()){
 const title=clean(item.title), summary=clean(item.description), t=title+' '+summary;
 if(!/강사|강의자|교수자/.test(t)||!/모집|채용|초빙|위촉/.test(t))return null;
 if(!/AI|인공지능|챗GPT|챗지피티|생성형|디지털|스마트폰|정보화/i.test(t))return null;
 let u;try{u=new URL(item.link);if(u.protocol!=='https:'&&u.protocol!=='http:')return null;}catch{return null;}
 const region=['서울','경기','인천','부산','대구','대전','광주','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주'].filter(x=>t.includes(x)).join(' · ')||'원문 확인';
 const field=(label)=>{const m=t.match(new RegExp('(?:'+label+')\\s*[:：]\\s*([^|;]{2,65})'));return m?m[1].trim():'원문 확인';};
 const pay=t.match(/(?:시간당|시급|회당|강사료|강의료|급여)\s*[:：]?\s*(?:시간당\s*)?[\d,]+\s*(?:만\s*)?원(?:\s*~\s*[\d,]+\s*(?:만\s*)?원)?/);
 // 검색 요약만으로 접수 중 여부를 단정하지 않는다.
 return {id:u.href,title,summary,url:u.href,source:u.hostname,region,agency:field('기관명|모집기관|채용기관'),date:field('교육기간|강의기간|강의일정'),time:field('강의시간|교육시간'),pay:pay?pay[0]:'원문 확인',deadline:field('접수기간|접수마감|모집기간'),status:'접수 여부 확인 필요',checkedAt:now.toISOString()};
}
export async function collect(env){
 if(!env.NAVER_CLIENT_ID||!env.NAVER_CLIENT_SECRET)throw new Error('검색 서비스 연결이 필요합니다. 설정 안내를 확인하세요.');
 const jobs=new Map(), errors=[];
 for(const query of queries){
  try{const u=new URL('https://openapi.naver.com/v1/search/webkr.json');u.search=new URLSearchParams({query,display:'50'});
   const r=await fetch(u,{headers:{'X-Naver-Client-Id':env.NAVER_CLIENT_ID,'X-Naver-Client-Secret':env.NAVER_CLIENT_SECRET},signal:AbortSignal.timeout(18000)});
   if(!r.ok)throw new Error('검색 응답 오류 '+r.status);
   for(const item of (await r.json()).items||[]){const row=parse(item);if(row)jobs.set(row.id,row);}
  }catch(e){errors.push(query+': '+e.message);}
 }
 if(errors.length===queries.length)throw new Error('전체 검색에 실패했습니다. 검색 서비스 설정과 실행 기록을 확인하세요.');
 return {updatedAt:new Date().toISOString(),mode:'search',errors,jobs:[...jobs.values()]};
}
