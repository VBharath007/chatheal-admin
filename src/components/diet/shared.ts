"use client";
export type Item={id:string;day:number;meal:string;food:string;planned:string;source:string};
export const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
export const units=['g','ml','piece','cup','tbsp','tsp','serving','liter'];
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(new Date());
export function monday(){const d=new Date(today()+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10);}
export async function request(path:string,method='GET',body?:unknown){const r=await fetch((process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000/api')+'/diet'+path,{method,credentials:'include',headers:{'Content-Type':'application/json','X-Portal':'admin'},body:body?JSON.stringify(body):undefined});if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||'Request failed. Please try again.');}return r.json();}
export async function download(path:string,name:string){const r=await fetch((process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000/api')+'/diet'+path,{credentials:'include',headers:{'X-Portal':'admin'}});if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.error||'Download failed');}const url=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
