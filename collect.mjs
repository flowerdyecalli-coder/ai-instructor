import {collect} from './collector.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
const data=await collect(process.env);
await mkdir('data',{recursive:true});
await writeFile('data/jobs.json',JSON.stringify(data,null,2));
console.log('수집 완료:',data.jobs.length,'건 / 부분 오류:',data.errors.length);
