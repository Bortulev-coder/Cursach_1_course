import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {build} from 'vite';
import react from '@vitejs/plugin-react';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundle=await build({
  root,
  configFile:false,
  publicDir:false,
  plugins:[
    {
      name:'relative-download-for-static-site',
      enforce:'pre',
      transform(code,id){
        if(id.replaceAll('\\','/').endsWith('/app/page.tsx')){
          return code.replaceAll('href="/methods.docx"','href="./public/methods.docx"');
        }
      },
    },
    react(),
  ],
  define:{'process.env.NODE_ENV':JSON.stringify('production')},
  build:{
    write:false,
    emptyOutDir:false,
    lib:{entry:path.join(root,'app/static-entry.tsx'),name:'ThixoLab',formats:['iife']},
    cssCodeSplit:false,
    minify:true,
    sourcemap:false,
    reportCompressedSize:false,
  },
});
const output=(Array.isArray(bundle)?bundle.flatMap(result=>result.output):bundle.output);
const js=output.filter(item=>item.type==='chunk').map(item=>item.code).join('\n');
const css=output.filter(item=>item.type==='asset'&&item.fileName.endsWith('.css')).map(item=>item.source).join('\n');
if(!js||!css)throw new Error('Static build must include both JavaScript and CSS.');
const favicon=await readFile(path.join(root,'public/favicon.svg'),'utf8');
const html=`<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Три методики получения тиксотропных систем, интерактивная модель и план исследования для курсовой работы.">
<meta name="theme-color" content="#7652ba">
<title>ТиксоЛаб — от структуры к эксперименту</title>
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(favicon)}">
<style>${css.replaceAll('</style','<\\/style')}</style>
</head>
<body>
<div id="root"></div>
<noscript>Для калькулятора и интерактивной модели включите JavaScript. <a href="./public/methods.docx">Скачать все методики в DOCX</a>.</noscript>
<script>${js.replaceAll('</script','<\\/script')}</script>
</body>
</html>
`;
await writeFile(path.join(root,'index.html'),html);
await writeFile(path.join(root,'.nojekyll'),'');
console.log(`Created standalone index.html: ${Buffer.byteLength(html)} bytes. CSS and JavaScript are embedded; no server or CDN required.`);
