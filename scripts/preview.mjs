// Local preview of the Next.js static export. Use a proper static host for production.
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, sep, extname } from 'node:path';
const root=resolve('out');
if (!existsSync(root)) throw new Error('Run npm run build before preview.');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.woff2':'font/woff2','.ttf':'font/ttf'};
const port=Number(process.env.PORT||process.argv[2]||3000);
createServer((req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
 let file;try {file=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400);return res.end();}
 if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end();}
 if(existsSync(file)&&statSync(file).isDirectory()){const index=resolve(file,'index.html');file=existsSync(index)?index:file+'.html';}
 if(!existsSync(file)&&existsSync(file+'.html'))file+='.html';
 if(!existsSync(file)||!statSync(file).isFile()){res.writeHead(404);return res.end('Not found');}
 res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
 if(req.method==='HEAD')return res.end();
 createReadStream(file).on('error',()=>res.destroy()).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log('Preview: http://localhost:'+port));
