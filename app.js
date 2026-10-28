'use strict';
const sample='1\n00:00:00,000 --> 00:00:03,000\n欢迎来到独立工作室今天我们用一个小工具整理字幕\n\n2\n00:00:02,800 --> 00:00:06,000\n先检查时间重叠，再调整字幕长度。\n\n3\n00:00:06,200 --> 00:00:09,500\n确认无误后导出字幕和纯文稿。\n';
let cues=[];
W.mount({...TOOL,demo:()=>{W.set('srt',sample);W.set('limit','18');W.set('find','独立工作室');W.set('replace','我的工作室');}});
W.add(W.field('file','导入SRT文件','file','','UTF-8编码；不会上传到服务器'),W.field('srt','SRT内容','textarea'),W.field('limit','每行建议字数（6—60）','number','18'),W.row(W.field('find','查找文字（原样匹配）','text'),W.field('replace','替换为','text')));
W.$('#f-file').accept='.srt,text/plain';W.$('#f-file').onchange=()=>W.guarded(async()=>{const f=W.$('#f-file').files[0];if(!f)return;if(f.size>2_000_000)throw Error('字幕文件请控制在2MB以内');W.set('srt',await f.text());W.status('已读取文件，请检查字幕');});
const extra=W.h('div',{class:'file-strip'});extra.append(W.h('button',{class:'small',text:'按建议字数换行',onclick:()=>W.guarded(()=>{const list=OPCLib.parseSrt(W.value('srt')),limit=getLimit();list.forEach(c=>c.text=OPCLib.wrapText(c.text,limit));W.set('srt',OPCLib.serializeSrt(list));inspect();})}),W.h('button',{class:'small',text:'应用文字替换',onclick:()=>W.guarded(()=>{if(!W.value('find'))throw Error('请填写查找文字');const list=OPCLib.parseSrt(W.value('srt'));list.forEach(c=>c.text=c.text.split(W.value('find')).join(W.value('replace')));if(list.some(c=>!c.text.trim()))throw Error('替换会产生空字幕，请保留字幕内容');W.set('srt',OPCLib.serializeSrt(list));inspect();})}));W.add(extra);
function getLimit(){const n=+W.value('limit');if(!Number.isInteger(n)||n<6||n>60)throw Error('每行字数请输入6—60之间的整数');return n;}
function inspect(){
 cues=OPCLib.parseSrt(W.value('srt'));const issues=OPCLib.checkSrt(cues,getLimit()),doc=W.h('article',{class:'document'});
 doc.append(W.h('h2',{text:'字幕检查报告'}),W.h('div',{class:issues.length?'warning':'notice',text:issues.length?'发现'+issues.length+'项需检查：'+issues.join('；'):'未发现时间重叠、超长行或高阅读速度问题。'}));
 doc.append(W.table(['序号','起止时间','字幕'],cues.map((c,i)=>[i+1,OPCLib.stamp(c.start)+' → '+OPCLib.stamp(c.end),c.text])));
 const buttons=W.h('div',{class:'file-strip',style:'margin-top:18px'});buttons.append(W.h('button',{class:'primary small',text:'下载SRT字幕',onclick:()=>W.download('整理后字幕.srt',OPCLib.serializeSrt(cues))}),W.h('button',{class:'small',text:'下载纯文稿',onclick:()=>W.download('字幕纯文稿.txt',cues.map(c=>c.text.replace(/\n/g,'')).join('\n'))}));doc.append(buttons);
 W.setResult('# 字幕检查报告\n条数：'+cues.length+'\n'+(issues.length?issues.map(s=>'- '+s).join('\n'):'无明显问题')+'\n\n## 纯文稿\n'+cues.map(c=>c.text.replace(/\n/g,'')).join('\n'),doc);W.status('已检查'+cues.length+'条。换行不改变时间轴；重叠需人工修改后重新检查');
}
W.onRun(inspect);
