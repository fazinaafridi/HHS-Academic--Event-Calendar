/* PART C, D: THE PROGRAM (JavaScript). Search for STEP 1, STEP 2 ... to jump between numbered sections.
   This version reads the events LIVE from a Google Sheet (see README.md). Viewers cannot add or change events. */
(async()=>{
/* STEP 1 | TODAY AND EMBED MODE. TODAY is read from the computer clock. EMBED turns on automatically when this page is shown inside another page (such as Google Sites): the page then has a FIXED height, the list under the calendar is replaced by a pop-up when you click a day. Add ?embed=0 to the link to turn it off. */
const _n=new Date(),TODAY=new Date(_n.getFullYear(),_n.getMonth(),_n.getDate());
const EMBED=(()=>{try{return window.self!==window.top&&!/[?&]embed=0/.test(location.search)}catch(e){return true}})();
document.body.classList.toggle('embed',EMBED);
const CFG=window.HHS_CONFIG||{};
document.getElementById('cal').innerHTML='<p style="padding:20px">Loading events\u2026</p>';

/* STEP 2 | WHERE THE EVENTS COME FROM. Normally from your Google Sheet: its "Publish to web" CSV link is set in config.js (sheetUrl). If the sheet cannot be reached the page shows the last copy saved in this browser, and if there is none, the built-in copy in data/fallback.js. SRC remembers which one is used so a small note can be shown under the calendar. */
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const dec=t=>t.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&amp;/g,'&');
/* STEP 3 | NAMES AND CLASSES. TN = event types (A, X, H, E, S). LV = every class: the letter is the short code, the text is the name shown on the page and typed in the sheet. CAMPUS_CLASSES = which classes each campus has (campus codes are in STEP 4). The Class list on the page shows only the classes of the selected campus, and an event for classes a campus does not have is hidden for that campus. OLDLV is only used to convert the old built-in copy (I-II, III-V ...) to single classes. */
const TN={A:'Academic',X:'Exams',H:'Holiday',E:'Event',S:'Sports / Other'};
const LV={a:'Pre-Nur',a1:'Nur',a2:'Prep',b:'I',c:'II',d:'III',e:'IV',f:'V',g:'VI',h:'VII',i:'VIII',j:'IX',k:'X',l:'XI',m:'IX-AKU',n:'X-AKU',o:'XI-AKU'};
const LVK=Object.keys(LV),AKU=k=>['m','n','o'].includes(k);
const CAMPUS_CLASSES={
  TLC: ['a','a1','a2','b'],                          // Pre-School till Class I
  IMC: ['a','a1','a2','b','c'],                      // Pre-School till Class II
  PEC: ['a','a1','a2','b','c'],
  OLG: ['a','a1','a2','b','c','d','e','f','g','h','i','j','k','l'],
  OLC: ['a','a1','a2','b','c','d','e','f','g','h','i','j','k','l','n','o'], // Pre-School till XI
  OLN: ['a','a1','a2','b','c','d','e','f','g','h','i','j'],
  OLS: ['a','a1','a2','b','c','d','e','f','g','h','i'],
  SSC: ['j','k','l','m','n','o'],
  JOH: ['a','a1','a2','b','c','d','e','f','g','h','i'],
  HS:  ['c','d','e','f','g','h','i','j','k','n','o'],
  HPP: ['a2','b','c'],
  HPS: ['a','a1','a2'],
  FT:  ['a2','b','c','d','e','f','g','h','i','j','k'],
  SOC: ['b','c','d','e','f','g','h','i','j','k']
};
const OLDLV={a:['a','a1','a2'],b:['b','c'],c:['d','e','f'],d:['g','h','i'],e:['j','k','l','m','n','o']};
/* clsText turns a list of classes into short text, e.g. III, IV, V becomes III-V. */
const clsText=ks=>{const s=LVK.filter(k=>ks.includes(k)),out=[];let i=0;while(i<s.length){let j=i;while(j+1<s.length&&LVK.indexOf(s[j+1])===LVK.indexOf(s[j])+1&&AKU(s[j+1])===AKU(s[j]))j++;out.push(j-i>=2?LV[s[i]]+'\u2013'+LV[s[j]]:s.slice(i,j+1).map(k=>LV[k]).join(', '));i=j+1}return out.join(', ')};

/* STEP 4 | CAMPUSES. Two groups: OL (O Level) and M (Matric). Each line is  CODE:'Display name'. Use the CODE in STEP 2. To add a campus, copy a line and give it a new CODE and name. */
const CG={
  OL:{IMC:'IMC',PEC:'IMC PECHS',OLG:'OLG',OLC:'OLC',OLN:'OLN',OLS:'OLS (O Level School)',SSC:'OLS Senior School & College',JOH:'HHS Johar'},
  M:{HS:'High School',HPP:'High School Pre Primary',HPS:'High School Pre School Section',TLC:'TLC',FT:'Fast Track',SOC:'Society Campus'}
};
const CN={...CG.OL,...CG.M},CS={};Object.keys(CG).forEach(k=>Object.keys(CG[k]).forEach(c=>CS[c]=k));


/* STEP 6 | READING THE SHEET. csvParse splits the downloaded text into rows and cells. parseSheet finds the columns by their heading names (so you may reorder columns), reads the dates (YYYY-MM-DD, or day/month/year), matches the Type / Stream / Campus / Class names, and builds the event list. Rows it cannot understand are skipped and listed when you open the page with ?check=1 added to the link. */
const nm=t=>String(t||'').toLowerCase().replace(/[\u2013\u2014]/g,'-').replace(/\s+/g,'');
const csvParse=t=>{const rows=[];let r=[],c='',q=0;t=t.replace(/^\ufeff/,'');for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else q=0}else c+=ch}else if(ch=='"')q=1;else if(ch==','){r.push(c);c=''}else if(ch=='\n'){r.push(c);rows.push(r);r=[];c=''}else if(ch!='\r')c+=ch}if(c||r.length){r.push(c);rows.push(r)}return rows};
let DORD='';
const toDate=v=>{v=String(v||'').trim();let m=v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return new Date(+m[1],m[2]-1,+m[3]);m=v.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);if(m){const a=+m[1],b=+m[2],y=m[3].length==2?2000+ +m[3]:+m[3],mdy=a>12?false:b>12?true:(DORD||CFG.dateOrder||'dmy')==='mdy';return mdy?new Date(y,a-1,b):new Date(y,b-1,a)}const d=new Date(v);return isNaN(d)?null:new Date(d.getFullYear(),d.getMonth(),d.getDate())};
const RMN={i:1,ii:2,iii:3,iv:4,v:5,vi:6,vii:7,viii:8,ix:9,x:10,xi:11},grp=n=>n<3?'b':n<6?'c':n<9?'d':'e';
const mkEvent=(o,id,problems,label)=>{const s=toDate(o.start);if(!s||s.getFullYear()<2000||s.getFullYear()>2100){problems.push(label+': start date not understood ("'+o.start+'")');return null}
 let e=toDate(o.end);if(!e||e<s)e=s;const t=String(o.title||'').trim();if(!t){problems.push(label+': event title is empty');return null}
 const c=[];String(o.campus||'').split(/[,;\/\n]+/).map(x=>x.trim()).filter(Boolean).forEach(x=>{const k=Object.keys(CN).find(k=>nm(k)===nm(x)||nm(CN[k])===nm(x))||Object.keys(CN).find(k=>nm(CN[k]).startsWith(nm(x)));k?c.push(k):problems.push(label+': unknown campus "'+x+'" (ignored)')});
 const lv=new Set();String(o.classes||'').split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean).forEach(x=>{const n=nm(x).replace(/aku-?eb/,'aku'),ex=LVK.find(k=>n===k||n===nm(LV[k]));if(ex){lv.add(ex);return}
  if(/^pre-?school/.test(n)){['a','a1','a2'].forEach(k=>lv.add(k));return}
  const r0=x.split(/\s*[\u2013\u2014]\s*|\s+to\s+/i),r=r0.length==2?r0:x.split(/\s*-\s*/),a=r.length==2&&LVK.find(k=>nm(LV[k])===nm(r[0])),b=r.length==2&&LVK.find(k=>nm(LV[k])===nm(r[1]));
  if(a&&b){const i=LVK.indexOf(a),j=LVK.indexOf(b);LVK.slice(Math.min(i,j),Math.max(i,j)+1).filter(k=>AKU(a)||AKU(b)||!AKU(k)).forEach(k=>lv.add(k))}else problems.push(label+': unknown class "'+x+'" (ignored)')});
 const tn=nm(o.type),k=tn.startsWith('ex')||tn[0]==='x'?'X':tn[0]==='a'?'A':tn[0]==='h'?'H':tn[0]==='e'?'E':tn?'S':'E',sn=nm(o.stream);
 return{id,s,e,all:/^(y|true|1)/i.test(nm(o.weekends)),t:esc(t),k,st:sn[0]==='o'?'OL':sn[0]==='m'?'M':'',c,lv:LVK.filter(k=>lv.has(k)),int:/^(y|true|1|internal)/i.test(nm(o.internal))}};
const parseSheet=(txt,opt={})=>{const rows=csvParse(txt),hd=(rows[0]||[]).map(nm),col=(n,inc)=>hd.findIndex(h=>inc?h.includes(n):h.startsWith(n)),ix={start:col('start'),end:col('end'),title:[col('event'),col('title')].find(i=>i>=0)??-1,type:col('type'),stream:col('stream'),campus:col('campus'),classes:col('class'),weekends:col('weekend',1),internal:col('internal'),appr:Math.max(col('addtocalendar',1),col('approved'))},problems=[],events=[];let skipped=0;
 let sawD=0,sawM=0;rows.slice(1).forEach(r=>[r[ix.start],r[ix.end]].forEach(v=>{const m=String(v||'').match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-]\d{2,4}/);if(m){if(+m[1]>12)sawD=1;if(+m[2]>12)sawM=1}}));DORD=sawD&&!sawM?'dmy':sawM&&!sawD?'mdy':'';
 if(ix.start<0||ix.title<0)return{events,problems:['The first row must contain the headings "Start date" and "Event title".'],skipped};
 if(opt.form&&ix.appr<0)return{events,problems:['The Form responses sheet needs a column headed "Add to calendar" (with a Yes/No drop-down) to the right of the form columns. Until then nothing is shown.'],skipped};
 rows.slice(1).forEach((r,i)=>{if(r.every(x=>!String(x).trim()))return;if(ix.appr>=0){const v=nm(r[ix.appr]);if(opt.form?!/^(y|true|1)/i.test(v):/^(n|false|0)/i.test(v)){skipped++;return}}const g=n=>ix[n]>=0?r[ix[n]]:'';const ev=mkEvent({start:g('start'),end:g('end'),title:g('title'),type:g('type'),stream:g('stream'),campus:g('campus'),classes:g('classes'),weekends:g('weekends'),internal:g('internal')},events.length,problems,'Row '+(i+2));if(ev)events.push(ev)});return{events,problems,skipped}};
const fromJSON=a=>{const p=[];const ev=a.map((o,i)=>mkEvent({start:o.d,end:o.e,title:o.t,type:{A:'Academic',X:'Exams',H:'Holiday',E:'Event',S:'Sports'}[o.k],stream:{OL:'O Level',M:'Matric'}[o.st]||'',campus:(o.c||[]).join(','),classes:(o.lv?[...o.lv].flatMap(x=>OLDLV[x]||[]).map(k=>LV[k]):[]).join(','),weekends:o.we?'Yes':'',internal:o.int?'Yes':''},i,p,'Built-in '+(i+1))).filter(Boolean);return{events:ev,problems:p}};
/* STEP 7 | LOADING. Tries the Google Sheet first, then the copy saved in this browser, then the built-in copy. */
const CK='hhsSheetCsv',CK2='hhsFormCsv';
const getSrc=async(url,key,opt)=>{if(!url)return null;let txt=null,from='sheet';try{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw 0;txt=await r.text();if(/^\s*</.test(txt))throw 0}catch(e){txt=null;try{txt=localStorage.getItem(key);from='cache'}catch(e2){}}
 if(!txt)return null;const x=parseSheet(txt,opt);if(!opt.form&&!x.events.length)return null;if(from==='sheet'){try{localStorage.setItem(key,txt)}catch(e){}}return{x,from}};
const A=await getSrc(CFG.sheetUrl,CK,{}),B=await getSrc(CFG.formSheetUrl,CK2,{form:true}),base=A?A.x:fromJSON(window.HHS_FALLBACK||[]);
const _seen=new Set(),RES={events:[...base.events,...(B?B.x.events:[])].filter(e=>{const k=+e.s+'|'+e.t.toLowerCase()+'|'+e.c.join();if(_seen.has(k))return false;_seen.add(k);return true}).map((e,i)=>({...e,id:i})),problems:[...base.problems,...(B?B.x.problems.map(p=>'Form sheet: '+p):[])]};
const SRC=(A&&A.from==='cache')||(B&&B.from==='cache')?'cache':A?'sheet':'fallback';
const INFO='Events sheet: '+(A?A.x.events.length+' events':'not connected (built-in copy used)')+' \u00b7 Form suggestions: '+(B?B.x.events.length+' added to calendar, '+B.x.skipped+' not added':'not connected');
const ALL=RES.events,acad=d=>d.getMonth()>=6?d.getFullYear():d.getFullYear()-1,YEARS=[...new Set(ALL.map(e=>acad(e.s)))].sort();
if(!YEARS.length)YEARS.push(acad(TODAY));
const qy=new URLSearchParams(location.search).get('year'),want=qy?parseInt(qy):NaN;
const Y0=YEARS.includes(want)?want:YEARS.includes(acad(TODAY))?acad(TODAY):YEARS[YEARS.length-1];
const lab=y=>y+'\u2013'+String(y+1).slice(2);
/* STEP 7B | THE MASTER LIST. E = the events of the selected academic year (July to June). */
const E=ALL.filter(e=>acad(e.s)===Y0);
/* STEP 8 | SMALL HELPERS. strs works out which stream an event belongs to; $ finds a box on the page; addD adds days to a date; fm writes a date as text, e.g. 15 Oct. */
const strs=e=>e.st?[e.st]:e.c.length?[...new Set(e.c.map(c=>CS[c]))]:['OL','M'];
const tk=e=>e.k;
const $=id=>document.getElementById(id),addD=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n),ws=d=>addD(d,-((d.getDay()+6)%7));
const fm=(d,w)=>d.toLocaleDateString('en-GB',{day:'numeric',month:'short',...(w?{weekday:'short'}:{})});

/* STEP 9 | WHAT IS SELECTED RIGHT NOW. S remembers the month on screen, the ticked event types, the chosen stream/campus/class, the search words and the view (month, week or day). */
const S={int:false,wide:false,c:(TODAY>=new Date(Y0,6,1)&&TODAY<=new Date(Y0+1,5,30))?TODAY:new Date(Y0,6,1),t:new Set(['A','X','H','E','S']),st:new Set(['OL','M']),cp:new Set(),lv:new Set(),q:'',view:'month'};

/* STEP 10 | FILTER RULES. pass() decides if an event should be shown, using the type chips, the dropdowns and the search box together. hit() checks whether an event falls on a given day. */
// Helper to check base filters excluding search term
/* campusCls = all classes that exist in the selected campus(es). */
const campusCls = () => { const s = new Set(); S.cp.forEach(c => (CAMPUS_CLASSES[c]||[]).forEach(k => s.add(k))); return s; };
const baseNoInt = e => {
  /* a selected campus also decides the stream: an O Level campus hides Matric-only events, and the other way round */
  const matchStream = strs(e).some(x=>S.st.has(x)) && (!S.cp.size || !e.st || [...S.cp].some(c=>CS[c]===e.st));
  const CC = campusCls();
  const campusHasClass = () => !e.c.length || e.c.some(c => [...S.lv].some(k => (CAMPUS_CLASSES[c]||[]).includes(k)));
  const matchCampus = !S.cp.size || (e.c.length ? e.c.some(c=>S.cp.has(c)) : (!e.lv.length || e.lv.some(k=>CC.has(k))));
   /* with a class selected: an event naming classes must include it; an event naming no class applies to every class of its campus */
  const matchLevel = !S.lv.size || (e.lv.length ? e.lv.some(x=>S.lv.has(x)) : campusHasClass());
  return matchStream && matchCampus && matchLevel;
};
const isWide = e => !e.int && !e.c.length && !e.lv.length; const passBaseFilter = e => baseNoInt(e) && (S.int && S.wide ? true : S.int ? e.int : S.wide ? isWide(e) : !e.int);
const tt = e => (e.int ? '<span class="intb">Internal</span> ' : '') + e.t;

const pass=e=>{
  const matchType = S.t.has(tk(e));
  const base = passBaseFilter(e);
  const q=S.q.trim().toLowerCase();
  const matchQ=!q||[dec(e.t),TN[tk(e)],e.int?'internal':''].join(' ').toLowerCase().includes(q);
  return matchType && base && matchQ;
};

const hit=(e,d)=>{const t=+d;if(t<+e.s||t>+e.e)return 0;return +e.s==+e.e||e.all||(d.getDay()%6!=0);};

/* STEP 11 | DRAWING THE CONTROLS. renderCats draws the type chips with their counts; renderDropdowns fills Campus and Class lists; renderTabs draws the Jul to Jun month tabs. */
function renderCats(){
  // Calculate category event counts dynamically based on active filters
  const counts = {A:0, X:0, H:0, E:0, S:0};
  E.filter(e => passBaseFilter(e)).forEach(e => {
    if(counts[e.k] !== undefined) counts[e.k]++;
  });

  const nInt=E.filter(e=>e.int&&baseNoInt(e)).length;
  $('cats').innerHTML=Object.entries(TN).map(([k,v])=>`
    <button class="chip cat" style="--c:var(--${k})" aria-pressed="${S.t.has(k)}" data-c="${k}">
      ${v} <span class="cat-count">${counts[k] || 0}</span>
    </button>
  `).join('')+(nInt||S.int?`<button class="chip cat intchip" aria-pressed="${S.int}" data-int="1" title="Show events meant only for campus/internal use">\u{1F512} Internal <span class="cat-count">${nInt}</span></button>`:'');
}

/* msRender draws a multi-select (a checkbox list inside <details>) and keeps it open/scrolled across redraws. */
const msRender=(box,allLabel,items,sel)=>{
  const old=box.querySelector('details'),open=old&&old.open,sc=old?old.querySelector('.ms-panel').scrollTop:0;
  const names=items.filter(([k])=>sel.has(k)).map(([,v])=>v);
  const txt=!names.length?allLabel:names.length<=2?names.join(', '):names.length+' selected';
  box.innerHTML=`<details${open?' open':''}><summary>${esc(txt)}</summary><div class="ms-panel">
    <button type="button" class="ms-clear" data-ms-clear="${box.id}">Clear selection</button>
    ${items.map(([k,v])=>`<label><input type="checkbox" value="${esc(k)}"${sel.has(k)?' checked':''}> ${esc(v)}</label>`).join('')}
  </div></details>`;
  box.querySelector('.ms-panel').scrollTop=sc;
};

function renderDropdowns(){
  const campuses=[];
  Object.keys(CG).filter(k=>S.st.has(k)).forEach(k=>Object.entries(CG[k]).forEach(([c,v])=>campuses.push([c,v])));
  msRender($('cpSel'),'All Campuses',campuses,S.cp);

  $('intChk').checked=S.int; $('wideChk').checked=S.wide;
  $('viewHint').textContent='Showing: '+(S.int&&S.wide?'everything, including internal events':S.int?'internal events only':S.wide?'school-wide events only (events that name no campus and no class)':'all public events for your selection');

  const allowed=S.cp.size?campusCls():null;
  msRender($('lvSel'),'All Classes',Object.entries(LV).filter(([k])=>!allowed||allowed.has(k)),S.lv);
}

function renderTabs(){
  const months=Array.from({length:12},(_,i)=>{const m=(6+i)%12,y=Y0+(i>5?1:0);return{y,m,l:new Date(y,m,1).toLocaleDateString('en-GB',{month:'short',year:'2-digit'})}});
  $('monthTabs').innerHTML=months.map(m=>{
    const isAct=S.c.getFullYear()===m.y&&S.c.getMonth()===m.m;
    return `<button aria-selected="${isAct}" data-m="${m.y}-${m.m}">${m.l}</button>`;
  }).join('');
}

/* STEP 12 | DRAWING THE CALENDAR. draw() is the main painter: it redraws the controls, then the month, week or day grid, then the event list under it. It runs after every click. */
function draw(){
  renderCats();
  renderDropdowns();
  renderTabs();

  // Sync Direct Date Picker Value
  const yyyy = S.c.getFullYear();
  const mm = String(S.c.getMonth() + 1).padStart(2, '0');
  const dd = String(S.c.getDate()).padStart(2, '0');
  $('directDatePicker').value = `${yyyy}-${mm}-${dd}`;

  const c=S.c, today=TODAY;
  let from, daysCount, headerTitle;

  if(S.view === 'month') {
    const f=new Date(c.getFullYear(),c.getMonth(),1), l=new Date(c.getFullYear(),c.getMonth()+1,0);
    from = ws(f);
    daysCount = Math.round((addD(ws(l),7)-from)/864e5);
    headerTitle = c.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
  } else if(S.view === 'week') {
    from = ws(c);
    daysCount = 7;
    const to = addD(from, 6);
    headerTitle = `Week of ${fm(from)} – ${fm(to)}`;
  } else {
    from = new Date(c.getFullYear(), c.getMonth(), c.getDate());
    daysCount = 1;
    headerTitle = c.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }

  $('mHeading').textContent = headerTitle;

  document.querySelectorAll('.view-btn').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.v === S.view);
  });

  // Render Grid
  let gridClass = S.view==='week' ? 'grid grid-week' : (S.view==='day' ? 'grid grid-day' : 'grid');
  let daysHeader = S.view === 'day' 
    ? `<div class="dh">${c.toLocaleDateString('en-GB',{weekday:'short'})}</div>`
    : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<div class="dh">${d}</div>`).join('');

  let g=`<div class="${gridClass}">${daysHeader}`;
  
  for(let i=0; i<daysCount; i++){
    const d=addD(from,i), ev=E.filter(e=>pass(e)&&hit(e,d));
    const isOut = S.view === 'month' && d.getMonth() !== c.getMonth();
    
    g+=`<div class="day${isOut?' out':''}${+d==+today?' today':''}" data-d="${+d}">
         <div class="dn"><b>${d.getDate()}</b></div>`;
    
    const cap=EMBED&&S.view==='month'?2:99;
    ev.forEach((e,ix) => {
      if(ix>=cap)return;
      const isMultiDay = +e.s !== +e.e;
      const isStart = +d === +e.s;
      
      if (!isMultiDay || isStart) {
        const pillText = isMultiDay ? `${tt(e)} (starts)` : tt(e);
        g += `<div class="event-pill ${isMultiDay ? 'span-cont' : ''}" style="--c:var(--${tk(e)})" title="${TN[tk(e)]}: ${e.t}">
                ${pillText}
              </div>`;
      } else {
        g += `<div class="event-pill span-cont" style="--c:var(--${tk(e)}); opacity: 0.75;" title="Continuing: ${e.t}">
                ${tt(e)}
              </div>`;
      }
    });

    if(ev.length>cap)g+=`<button class="more" data-d="${+d}">+${ev.length-cap} more</button>`;
    g+='</div>';
  }
  $('cal').innerHTML=g+'</div>';

  // Render Detailed Event Overview below
  let endRange = addD(from, daysCount - 1);
  const visibleEvents = E.filter(e=>pass(e)&&(+e.e>=+from && +e.s<=+endRange)).sort((a,b)=>a.s-b.s);

  let ov = `<h3>Events for ${headerTitle} (${visibleEvents.length})</h3>`;
  if(visibleEvents.length){
    ov += '<ul>' + visibleEvents.map(e => `
      <li style="--c:var(--${tk(e)})" class="${e.s<=today&&e.e>=today?'on':''}">
        <span class="d">${+e.s==+e.e ? fm(e.s) : fm(e.s)+' – '+fm(e.e)}</span>
        <span>${tt(e)}</span>
        <span class="m"><b>${TN[tk(e)]}</b> · ${e.c.length ? e.c.map(x=>CN[x]).join(', ') : 'All sections'}</span>
      </li>
    `).join('') + '</ul>';
  } else {
    ov += '<p class="none">Nothing scheduled for this period.</p>';
  }

  $('overview').innerHTML = ov;
}

// Live Autocomplete Suggestions logic
/* STEP 13 | SEARCH BOX. Shows suggestions while typing and jumps to the event you pick. */
const qInput = $('q');
const suggestionsBox = $('suggestionsBox');

function updateSuggestions(){
  const val = qInput.value.trim().toLowerCase();
  if(!val) {
    suggestionsBox.classList.remove('open');
    suggestionsBox.innerHTML = '';
    return;
  }

  // Filter matching events based on query and base stream/campus filters
  const matches = E.filter(e => passBaseFilter(e) && dec(e.t).toLowerCase().includes(val)).slice(0, 8);

  if(!matches.length){
    suggestionsBox.innerHTML = '<div class="suggestion-item"><span class="suggestion-title" style="color:var(--mute)">No matching calendar events</span></div>';
  } else {
    suggestionsBox.innerHTML = matches.map(e => `
      <div class="suggestion-item" data-id="${e.id}">
        <span class="suggestion-title">${tt(e)}</span>
        <div class="suggestion-meta">
          <span>${+e.s === +e.e ? fm(e.s) : fm(e.s) + ' - ' + fm(e.e)}</span>
          <span class="suggestion-tag" style="--c:var(--${tk(e)})">${TN[tk(e)]}</span>
        </div>
      </div>
    `).join('');
  }
  suggestionsBox.classList.add('open');
}

qInput.addEventListener('input', e => {
  S.q = e.target.value;
  updateSuggestions();
  draw();
});

qInput.addEventListener('focus', () => { if(qInput.value.trim()) updateSuggestions(); });

suggestionsBox.addEventListener('click', e => {
  const item = e.target.closest('.suggestion-item');
  if(!item || !item.dataset.id) return;
  
  const selectedEvent = E.find(ev => ev.id == item.dataset.id);
  if(selectedEvent) {
    S.q = selectedEvent.t;
    qInput.value = selectedEvent.t;
    S.c = new Date(selectedEvent.s.getFullYear(), selectedEvent.s.getMonth(), 1);
    suggestionsBox.classList.remove('open');
    draw();
  }
});

// Close suggestions on outside click
document.addEventListener('click', e => {
  if(!e.target.closest('.search-wrapper')) {
    suggestionsBox.classList.remove('open');
  }
});

// Direct Date Picker
$('directDatePicker').addEventListener('change', e=>{
  if(e.target.value) {
    const [y, m, d] = e.target.value.split('-').map(Number);
    S.c = new Date(y, m - 1, d);
    draw();
  }
});

/* STEP 14 | WHAT HAPPENS WHEN YOU CLICK a type chip, month tab, Clear Filters or the Month/Week/Day buttons. */
document.addEventListener('click',ev=>{
  const b=ev.target.closest('button');
  if(!b)return;

  if(b.id==='clrBtn'){
    S.t=new Set(['A','X','H','E','S']); S.st=new Set(['OL','M']); S.cp.clear(); S.lv.clear(); S.q=''; S.int=false; S.wide=false; $('q').value='';
    suggestionsBox.classList.remove('open');
  }
  if(b.dataset.int){ S.int=!S.int; }
  if(b.dataset.msClear){ (b.dataset.msClear==='cpSel'?S.cp:S.lv).clear(); }
  if(b.dataset.c){
    const k=b.dataset.c;
    S.t.has(k)?S.t.delete(k):S.t.add(k);
  }
  if(b.dataset.m){
    const [y,m]=b.dataset.m.split('-');
    S.c=new Date(y,m,1);
  }
  if(b.dataset.v){
    S.view = b.dataset.v;
  }
  draw();
});

/* Close an open multi-select when you click outside it. */
document.addEventListener('click',e=>{
  const path=e.composedPath();
  document.querySelectorAll('.ms details[open]').forEach(d=>{ if(!path.includes(d.parentElement)) d.open=false; });
});

/* STEP 15 | WHAT HAPPENS WHEN YOU CHANGE a dropdown (Stream, Campus, Class) or the date picker. */
document.addEventListener('change',e=>{
  if(e.target.id==='stSel'){
    const v=e.target.value;
    S.st = (v==='ALL') ? new Set(['OL','M']) : new Set([v]);
    S.cp.clear(); draw();
  }
  if(e.target.closest('#cpSel')&&e.target.type==='checkbox'){
    e.target.checked?S.cp.add(e.target.value):S.cp.delete(e.target.value);
    [...S.lv].forEach(k=>{ if(S.cp.size && !campusCls().has(k)) S.lv.delete(k); });
    draw();
  }
      if(e.target.id==='intChk'){ S.int=e.target.checked; draw(); }
    if(e.target.id==='wideChk'){ S.wide=e.target.checked; draw(); }
  if(e.target.closest('#lvSel')&&e.target.type==='checkbox'){
    e.target.checked?S.lv.add(e.target.value):S.lv.delete(e.target.value);
    draw();
  }
});


/* PART D: VIEWER TOOLS (print / download / day pop-up / year list). */
const md=d=>String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');
const ymd=d=>d.getFullYear()+md(d);
const dlg=$('dlg'),openD=h=>{dlg.innerHTML=h;dlg.showModal()};
const dl=(name,txt,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;document.body.appendChild(a);a.click();a.remove()};
/* STEP 17 | PRINT AND DOWNLOAD BUILDERS. They prepare the printable list, the Excel (CSV) file and the calendar (.ics) file from the events currently shown. */
const fsum=()=>[S.st.size<2?[...S.st].map(x=>x==='OL'?'O Level':'Matric').join(''):'',[...S.cp].map(c=>CN[c]).join(', '),(S.lv.size?'Classes '+clsText([...S.lv]):''),S.t.size<5?[...S.t].map(k=>TN[k]).join(' / '):'',S.q?'Search: '+S.q:''].filter(Boolean).join(' · ')||'All streams, campuses and classes';
const scoped=sc=>{const f=new Date(S.c.getFullYear(),S.c.getMonth(),1),l=new Date(S.c.getFullYear(),S.c.getMonth()+1,0);return E.filter(e=>pass(e)&&(sc==='year'||(+e.e>=+f&&+e.s<=+l))).sort((a,b)=>a.s-b.s)};
const monthName=()=>S.c.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
const who=e=>(e.c.length?e.c.map(c=>CN[c]).join(', '):'All')+(e.lv.length?' · Classes '+clsText(e.lv):'');
const rng=(e,w)=>+e.s==+e.e?fm(e.s,w):fm(e.s)+' – '+fm(e.e);
const listHTML=(evs,title)=>{let h=`<h1>${title}</h1><p class="psub">${fsum()} · printed ${fm(TODAY)} ${TODAY.getFullYear()}</p>`,cur='';
  evs.forEach(e=>{const m=e.s.toLocaleDateString('en-GB',{month:'long',year:'numeric'});if(m!==cur){if(cur)h+='</tbody></table>';cur=m;h+=`<h2>${m}</h2><table><thead><tr><th>Date</th><th>Event</th><th>Type</th><th>Applies to</th></tr></thead><tbody>`}
    h+=`<tr><td>${rng(e,1)}</td><td>${e.int?'[Internal] ':''}${e.t}</td><td>${TN[e.k]}</td><td>${who(e)}</td></tr>`});
  return h+(cur?'</tbody></table>':'<p>No events match these filters.</p>')};
const q=t=>'"'+dec(t).replace(/"/g,'""')+'"';
const csv=evs=>'\ufeff'+['Start,End,Event,Type,Stream,Applies to,Internal'].concat(evs.map(e=>[ymd(e.s).replace(/(\d{4})(\d\d)(\d\d)/,'$1-$2-$3'),ymd(e.e).replace(/(\d{4})(\d\d)(\d\d)/,'$1-$2-$3'),q(e.t),TN[e.k],strs(e).length>1?'Both':strs(e)[0],q(who(e)),e.int?'Yes':'No'].join(','))).join('\r\n');
const ics=evs=>{const x=t=>dec(t).replace(/[\\;,]/g,'\\$&').replace(/\n/g,'\\n');return 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//HHS Calendar//EN\r\n'+evs.map(e=>`BEGIN:VEVENT\r\nUID:${e.id}-${ymd(e.s)}@hhs-calendar\r\nDTSTAMP:${ymd(TODAY)}T000000Z\r\nDTSTART;VALUE=DATE:${ymd(e.s)}\r\nDTEND;VALUE=DATE:${ymd(addD(e.e,1))}\r\nSUMMARY:${x(e.t)}\r\nCATEGORIES:${TN[e.k]}\r\nDESCRIPTION:${x(who(e))}\r\nEND:VEVENT\r\n`).join('')+'END:VCALENDAR\r\n'};

/* STEP 18 | THE PRINT / DOWNLOAD WINDOW. */
const printForm=()=>`<form method="dialog"><h3>Print or download</h3><p class="hint">Uses your current filters: ${fsum()}</p>
<div class="f"><label>What to include</label><select id="pScope"><option value="screen">Print exactly what is on screen (current view)</option><option value="month">List of ${monthName()}</option><option value="year">List of the whole year</option></select></div>
<p class="hint">Excel (CSV) and Calendar (.ics) files follow the same choice. Choose "Save as PDF" in the print window to get a PDF.</p>
<div class="acts"><button class="chip" value="cancel">Close</button><button class="chip" type="button" data-act="csv">Excel (CSV)</button><button class="chip" type="button" data-act="ics">Calendar (.ics)</button><button class="chip" type="button" data-act="doprint">Print / PDF</button></div></form>`;
const printNow=cls=>{dlg.close();document.body.classList.add(cls);setTimeout(()=>window.print(),80)};
addEventListener('afterprint',()=>document.body.classList.remove('plist','pscreen'));

/* STEP 20 | BUTTON ACTIONS for Today, Print / Download and the three download choices. */
document.addEventListener('click',ev=>{const b=ev.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,sc=($('pScope')||{}).value||'month';
  if(a==='today'){S.c=TODAY<new Date(Y0,6,1)||TODAY>new Date(Y0+1,5,30)?new Date(Y0,6,1):TODAY;draw()}
  else if(a==='print')openD(printForm());
  else if(a==='doprint'){if(sc==='screen')printNow('pscreen');else{$('printArea').innerHTML=listHTML(scoped(sc),'HHS Calendar '+lab(Y0)+(sc==='month'?' \u00b7 '+monthName():''));printNow('plist')}}
  else if(a==='csv')dl('HHS-calendar-'+lab(Y0)+'.csv',csv(scoped(sc==='year'?'year':'month')),'text/csv');
  else if(a==='ics')dl('HHS-calendar-'+lab(Y0)+'.ics',ics(scoped(sc==='year'?'year':'month')),'text/calendar');
  else if(a==='closeD')dlg.close()});
/* STEP 29 | DAY POP-UP (embed mode). Clicking a day opens a window listing everything on that day, with type, stream, campus and classes. */
document.addEventListener('click',ev=>{if(!EMBED)return;const c=ev.target.closest('[data-d]');if(!c)return;const d=new Date(+c.dataset.d),evs=E.filter(e=>pass(e)&&hit(e,d));
  openD(`<form method="dialog"><h3>${d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</h3>`+(evs.length?evs.map(e=>`<div class="dayEv" style="--c:var(--${tk(e)})"><b>${tt(e)}</b><small>${TN[tk(e)]} · ${rng(e,0)} · ${who(e)}${e.st?' · '+SN2[e.st]:''}</small></div>`).join(''):'<p class="hint">No events on this day with the current filters.</p>')+'<div class="acts"><button class="chip" value="cancel">Close</button></div></form>')});
/* STEP 30 | YEAR LIST, SUGGEST BUTTON AND SOURCE NOTE. The year list is built from the dates in the sheet, so adding rows dated 2027-28 makes that year appear automatically. */
$('yrSel').innerHTML=YEARS.map(y=>`<option value="${y}"${y===Y0?' selected':''}>${lab(y)}</option>`).join('');
$('yrSel').onchange=e=>{location.search='?year='+e.target.value};
$('ttl').textContent='HHS Academic & Event Calendar '+lab(Y0);document.title='HHS Academic & Event Calendar '+lab(Y0);
/* STEP 30A | EVENT SUGGESTION POPUP */

/* Multi-select box for the suggestion pop-up (checkbox list). msSum updates the summary text. */
const msBox=(id,name,label,allLabel,items)=>`
  <div class="f"><label>${label}</label>
    <div class="ms" id="${id}" data-all="${esc(allLabel)}">
      <details><summary>${esc(allLabel)}</summary>
        <div class="ms-panel">
          ${items.map(v=>`<label><input type="checkbox" name="${name}" value="${esc(v)}"> ${esc(v)}</label>`).join('')}
        </div>
      </details>
    </div>
  </div>`;
const msSum=box=>{
  const v=[...box.querySelectorAll('input:checked')].map(i=>i.value);
  box.querySelector('summary').textContent=!v.length?box.dataset.all:v.length<=2?v.join(', '):v.length+' selected';
};

const suggestionForm = () => {

  const typeOptions = [
    ['Academic', 'Academic'],
    ['Exams', 'Exams'],
    ['Holiday', 'Holiday'],
    ['Event', 'Event'],
    ['Sports / Other', 'Sports / Other']
  ];

  const streamOptions = [
    ['Both', 'Both'],
    ['Matric', 'Matric'],
    ['O Levels', 'O Levels']
  ];

  return `
    <form method="dialog"
          class="suggest-form"
          id="suggestForm">

      <h3>Suggest an Event</h3>

      <p class="suggest-intro">
        Please provide the event details below.
        Your suggestion will be reviewed before it is added to the calendar.
      </p>

      <div class="f2">

        <div class="f">
          <label for="suggestStart">
            Start date <span class="required">*</span>
          </label>

          <input
            type="date"
            id="suggestStart"
            name="startDate"
            required>
        </div>

        <div class="f">
          <label for="suggestEnd">
            End date
          </label>

          <input
            type="date"
            id="suggestEnd"
            name="endDate">
        </div>

      </div>

      <div class="f">
        <label for="suggestTitle">
          Event title <span class="required">*</span>
        </label>

        <input
          type="text"
          id="suggestTitle"
          name="eventTitle"
          maxlength="200"
          placeholder="Enter event title"
          required>
      </div>

      <div class="f">
        <label for="suggestType">
          Type <span class="required">*</span>
        </label>

        <select id="suggestType" name="type" required>
          <option value="">Select type</option>
          ${typeOptions.map(([v,t]) =>
            `<option value="${esc(v)}">${esc(t)}</option>`
          ).join('')}
        </select>
      </div>

      <div class="f">
        <label for="suggestStream">
          Stream
        </label>

        <select id="suggestStream" name="stream">
          ${streamOptions.map(([v,t]) =>
            `<option value="${esc(v)}">${esc(t)}</option>`
          ).join('')}
        </select>
      </div>

      ${msBox('suggestCampus','campuses','Campus','All Campuses',Object.values(CN))}
      ${msBox('suggestClass','classes','Class','All Classes',Object.values(LV))}

      <div class="f2">

        <div class="f">
          <label for="suggestWeekends">
            Include weekends
          </label>

          <select id="suggestWeekends" name="includeWeekends">
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        <div class="f">
          <label for="suggestInternal">
            Internal
          </label>

          <select id="suggestInternal" name="internal">
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

      </div>

      <div class="error" id="suggestError"></div>

      <div class="success" id="suggestSuccess">
        Your event suggestion has been submitted for review.
      </div>

      <div class="acts">

        <button
          class="chip"
          type="button"
          data-act="closeD">
          Cancel
        </button>

        <button
          class="chip suggest-submit"
          type="submit"
          id="suggestSubmit">
          Submit suggestion
        </button>

      </div>

    </form>
  `;
};

async function submitSuggestion(form) {

  const submitUrl = CFG.submitUrl;

  if (!submitUrl) {
    throw new Error(
      'The event suggestion submission URL has not been configured yet.'
    );
  }

  const data = new URLSearchParams();

  data.set(
    'startDate',
    form.elements.startDate.value
  );

  data.set(
    'endDate',
    form.elements.endDate.value
  );

  data.set(
    'eventTitle',
    form.elements.eventTitle.value.trim()
  );

  data.set(
    'type',
    form.elements.type.value
  );

  data.set(
    'stream',
    form.elements.stream.value
  );

  const pick=n=>[...form.querySelectorAll(`input[name="${n}"]:checked`)].map(i=>i.value).join(', ');
  data.set('campuses', pick('campuses'));

  data.set('classes', pick('classes'));

  data.set(
    'includeWeekends',
    form.elements.includeWeekends.value
  );

  data.set(
    'internal',
    form.elements.internal.value
  );

  /*
   * no-cors is intentional.
   * Google Apps Script is hosted on another domain.
   * We only need to send the data; we do not need to read
   * the response in the browser.
   */
  await fetch(submitUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: data.toString()
  });
}

$('sugBtn').addEventListener('click', () => {

  dlg.innerHTML = suggestionForm();

  dlg.showModal();

  const form = $('suggestForm');

  const start = $('suggestStart');
  const end = $('suggestEnd');

  /*
   * If the user chooses a start date, prevent an earlier
   * end date from being selected.
   */
  start.addEventListener('change', () => {

    end.min = start.value;

    if (end.value && end.value < start.value) {
      end.value = start.value;
    }

  });

  /*
   * Stream first: if a single stream is selected on the main page, preselect it.
   */
  if (S.st.size === 1) {
    const stream = [...S.st][0];
    $('suggestStream').value = stream === 'OL' ? 'O Levels' : stream === 'M' ? 'Matric' : 'Both';
  }

  /*
   * The Campus list follows the chosen Stream: O Levels shows only O Level campuses,
   * Matric only Matric campuses, Both shows all. Ticked campuses that are no longer
   * in the list are unticked.
   */
  const fillCampus = () => {
    const box = $('suggestCampus'), panel = box.querySelector('.ms-panel');
    const keep = new Set([...box.querySelectorAll('input:checked')].map(i => i.value));
    const sv = $('suggestStream').value;
    const names = Object.values(sv === 'O Levels' ? CG.OL : sv === 'Matric' ? CG.M : CN);
    panel.innerHTML = names.map(v =>
      `<label><input type="checkbox" name="campuses" value="${esc(v)}"${keep.has(v) ? ' checked' : ''}> ${esc(v)}</label>`).join('');
    msSum(box);
  };
  fillCampus();
  $('suggestStream').addEventListener('change', fillCampus);

  /*
   * Preselect the campuses and classes currently chosen on the main page.
   */
  [...S.cp].forEach(c=>{
    const i=[...$('suggestCampus').querySelectorAll('input')].find(i=>i.value===CN[c]);
    if(i) i.checked=true;
  });
  [...S.lv].forEach(k=>{
    const i=[...$('suggestClass').querySelectorAll('input')].find(i=>i.value===LV[k]);
    if(i) i.checked=true;
  });
  ['suggestCampus','suggestClass'].forEach(id=>{
    const b=$(id); msSum(b); b.addEventListener('change',()=>msSum(b));
  });

  /*
   * Submit the suggestion.
   */
  form.addEventListener('submit', async ev => {

    ev.preventDefault();

    const errorBox = $('suggestError');
    const successBox = $('suggestSuccess');
    const submitBtn = $('suggestSubmit');

    errorBox.style.display = 'none';
    successBox.style.display = 'none';

    const startValue = start.value;
    const endValue = end.value;
    const titleValue = $('suggestTitle').value.trim();
    const typeValue = $('suggestType').value;

    if (!startValue) {
      errorBox.textContent = 'Please select a start date.';
      errorBox.style.display = 'block';
      return;
    }

    if (endValue && endValue < startValue) {
      errorBox.textContent =
        'End date cannot be earlier than the start date.';
      errorBox.style.display = 'block';
      return;
    }

    if (!titleValue) {
      errorBox.textContent = 'Please enter the event title.';
      errorBox.style.display = 'block';
      return;
    }

    if (!typeValue) {
      errorBox.textContent = 'Please select the event type.';
      errorBox.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {

      await submitSuggestion(form);

      successBox.style.display = 'block';

      submitBtn.style.display = 'none';

      /*
       * Give the user a moment to see the confirmation.
       */
      setTimeout(() => {
        dlg.close();
      }, 1800);

    } catch (error) {

      console.error('Event suggestion error:', error);

      errorBox.textContent =
        'We could not submit the suggestion. Please try again.';

      errorBox.style.display = 'block';

      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit suggestion';
    }

  });

});

$('srcNote').textContent={sheet:'Events are loaded live from the school\u2019s Google Sheet.',cache:'The Google Sheet could not be reached, so the last saved copy is shown.',fallback:'Showing the built-in copy of the calendar (the Google Sheet is not connected yet).'}[SRC];
if(/[?&]check=1/.test(location.search)){$('srcNote').innerHTML+='<br><b>Data check:</b> '+INFO+' \u00b7 '+ALL.length+' events in total. '+(RES.problems.length?'<br>'+RES.problems.map(esc).join('<br>'):'No problems found.')}
/* STEP 28 | START-UP. Draws the calendar for the first time. Keep this line last. */
draw();
})().catch(e=>{document.getElementById('cal').innerHTML='<p style="padding:20px;color:#b3261e">Sorry, the calendar could not start: '+String(e&&e.message||e)+'</p>';console.error(e)});
