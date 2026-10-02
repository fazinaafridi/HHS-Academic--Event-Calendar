/* PART C, D, E: THE PROGRAM (JavaScript). Search for STEP 1, STEP 2 ... to jump between numbered sections. */
/* STEP 1 | YEAR AND TODAY. Y0 is the year the selected academic session starts (read from the data file in the data folder): 2026 means Jul 2026 to Jun 2027. TODAY is read from your computer clock. Change Y0 only if you are making a new year by hand. */
/* STEP 1B | EMBED MODE. EMBED turns on automatically when this page is shown inside another page (such as Google Sites). Add ?embed=0 to the link to turn it off. In embed mode the page has a FIXED height (so Google Sites needs no inner scrolling), the list under the calendar is replaced by a pop-up when you click a day, and the Add / Import / Export buttons are hidden. */
const EMBED=(()=>{try{return window.self!==window.top&&!/[?&]embed=0/.test(location.search)}catch(e){return true}})();
document.body.classList.toggle('embed',EMBED);
/* [KEEP FIRST] Snapshot of this page's own source, used by "Next-year setup" to build a new file. */
/* [YEAR] First year of the academic session (Jul Y0 - Jun Y0+1). Next-year setup updates this for you. */
const Y0=HHS.cur.start;
const _n=new Date(),TODAY=new Date(_n.getFullYear(),_n.getMonth(),_n.getDate());
/* STEP 2 | THE EVENTS. They are NOT written here any more. Each academic year has its own data file in the data folder (for example data/2026-27.js), listed in data/years.js. To add, change or delete an event, edit that data file (one event per line, explained at the top of the file) or use the + Add event / Import buttons. toLine() below only converts each data-file event into the short line format the rest of this program uses. */
const toLine=ev=>{const m2=s=>s.slice(5,7)+s.slice(8,10);return m2(ev.d)+(ev.e&&ev.e!==ev.d?(ev.we?'+':'-')+m2(ev.e):'')+'|'+String(ev.t).replace(/\|/g,'/')+'|'+ev.k+'|'+(ev.st||'')+'|'+(ev.c||[]).join(',')+'|'+(ev.lv||'')};
const D=((HHS.data[HHS.cur.id]||{}).events||[]).map(toLine);

/* STEP 3 | NAMES. TN = names of event types (A, X, H, E, S). LV = class groups (a = Pre-School, b = I-II, c = III-V, d = VI-VIII, e = IX-XI). Change the words inside the quotes to rename them. */
const TN={A:'Academic',X:'Exams',H:'Holiday',E:'Event',S:'Sports / Other'},LV={a:'Pre-School (PN–Prep)',b:'I–II',c:'III–V',d:'VI–VIII',e:'IX–XI'};

/* CAMPUS-SPECIFIC CLASSES MAPPING */
const CAMPUS_CLASSES = {
  TLC: ['a','a1','a2','b'],                              // Pre-School till Class I
  IMC: ['a','a1','a2','b','c'],                         // Pre-School till Class II
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

/* STEP 4 | CAMPUSES. Two groups: OL (O Level) and M (Matric). Each line is  CODE:'Display name'. Use the CODE in STEP 2. To add a campus, copy a line and give it a new CODE and name. */
const CG={
  OL:{IMC:'IMC',PEC:'IMC PECHS',OLG:'OLG',OLC:'OLC',OLN:'OLN',OLS:'OLS (O Level School)',SSC:'OLS Senior School & College',JOH:'HHS Johar'},
  M:{HS:'High School',HPP:'High School Pre Primary',HPS:'High School Pre School Section',TLC:'TLC',FT:'Fast Track',SOC:'Society Campus'}
};
const CN={...CG.OL,...CG.M},CS={};Object.keys(CG).forEach(k=>Object.keys(CG[k]).forEach(c=>CS[c]=k));

/* STEP 5 | HELPER TOOLS (rarely edited). P turns 1015 into a real date. esc/dec make titles safe to show. parse turns one line of STEP 2 into an event the page can use. */
const P=s=>{const m=+s.slice(0,2);return new Date(m>=7?Y0:Y0+1,m-1,+s.slice(2))};
const esc=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const dec=t=>t.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&amp;/g,'&');
const parse=(r,id,cu,x)=>{const[d,t,k,st='',c='',lv='']=r.split('|'),[a,b=a]=d.split(/[-+]/);return{id,cu,raw:r,s:P(a),e:P(b),all:d.includes('+'),t:cu||x?esc(t):t,k,st,c:c?c.split(','):[],lv}};
/* STEP 6 | MEMORY IN THIS BROWSER. Events you add with the + Add event button (CUS), and your edits/removals of the school's events (OVR), are kept in this browser only. They are not written into the file until you press Download file with all events. */
/* Events added by users are kept in this browser (localStorage), same line format as the list above. */
const LSK='hhsCustom'+Y0;let CUS=[];try{CUS=JSON.parse(localStorage.getItem(LSK)||'[]')}catch(x){}
const saveC=()=>{try{localStorage.setItem(LSK,JSON.stringify(CUS))}catch(x){}};
/* Edits and removals of the school's built-in events are kept in this browser too: {original line: new line, or null = removed}. */
const OSK='hhsOvr'+Y0;let OVR={};try{OVR=JSON.parse(localStorage.getItem(OSK)||'{}')}catch(x){}
const saveO=()=>{try{localStorage.setItem(OSK,JSON.stringify(OVR))}catch(x){}};
/* STEP 7 | THE MASTER LIST. E is the final list of events the page uses = school events (STEP 2) with your edits/removals applied + events you added. rebuild() recreates it after any change. */
const E=[];const rebuild=()=>E.splice(0,E.length,...D.filter(Boolean).flatMap((r,i)=>{const o=OVR[r];if(o===null)return[];const x=parse(o===undefined?r:o,i,0,o!==undefined);x.orig=r;x.ed=o!==undefined;return[x]}),...CUS.map((r,i)=>parse(r,'c'+i,1)));rebuild();

/* STEP 8 | SMALL HELPERS. strs works out which stream an event belongs to; $ finds a box on the page; addD adds days to a date; fm writes a date as text, e.g. 15 Oct. */
const strs=e=>e.st?[e.st]:e.c.length?[...new Set(e.c.map(c=>CS[c]))]:['OL','M'];
const tk=e=>e.k;
const $=id=>document.getElementById(id),addD=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n),ws=d=>addD(d,-((d.getDay()+6)%7));
const fm=(d,w)=>d.toLocaleDateString('en-GB',{day:'numeric',month:'short',...(w?{weekday:'short'}:{})});

/* STEP 9 | WHAT IS SELECTED RIGHT NOW. S remembers the month on screen, the ticked event types, the chosen stream/campus/class, the search words and the view (month, week or day). */
const S={c:(TODAY>=new Date(Y0,6,1)&&TODAY<=new Date(Y0+1,5,30))?TODAY:new Date(Y0,6,1),t:new Set(['A','X','H','E','S']),st:new Set(['OL','M']),cp:new Set(),lv:new Set(),q:'',view:'month'};

/* STEP 10 | FILTER RULES. pass() decides if an event should be shown, using the type chips, the dropdowns and the search box together. hit() checks whether an event falls on a given day. */
// Helper to check base filters excluding search term
const passBaseFilter = e => {
  const matchStream = strs(e).some(x=>S.st.has(x));
  const matchCampus = !S.cp.size || (e.c.length ? e.c.some(c=>S.cp.has(c)) : true);
  const matchLevel = !S.lv.size || !e.lv || [...e.lv].some(x=>S.lv.has(x));
  return matchStream && matchCampus && matchLevel;
};

const pass=e=>{
  const matchType = S.t.has(tk(e));
  const base = passBaseFilter(e);
  const q=S.q.trim().toLowerCase();
  const matchQ=!q||[e.t,TN[tk(e)]].join(' ').toLowerCase().includes(q);
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

  $('cats').innerHTML=Object.entries(TN).map(([k,v])=>`
    <button class="chip cat" style="--c:var(--${k})" aria-pressed="${S.t.has(k)}" data-c="${k}">
      ${v} <span class="cat-count">${counts[k] || 0}</span>
    </button>
  `).join('');
}

function renderDropdowns(){
  const cpSel=$('cpSel');
  cpSel.innerHTML='<option value="">All Campuses</option>';
  const activeCampuses = new Map();
  Object.keys(CG).filter(k=>S.st.has(k)).forEach(k=>Object.entries(CG[k]).forEach(([c,v])=>activeCampuses.set(c,v)));
  activeCampuses.forEach((v,c)=>{
    cpSel.innerHTML+=`<option value="${c}" ${S.cp.has(c)?'selected':''}>${v}</option>`;
  });

  // Calculate allowed class keys based on currently selected campus(es)
  let allowedClasses = null;
  if(S.cp.size > 0) {
    allowedClasses = new Set();
    S.cp.forEach(c => {
      if(CAMPUS_CLASSES[c]) {
        CAMPUS_CLASSES[c].forEach(clsKey => allowedClasses.add(clsKey));
      }
    });
  }

  const lvSel=$('lvSel');
  lvSel.innerHTML='<option value="">All Classes</option>';
  Object.entries(LV).forEach(([k,v])=>{
    if(!allowedClasses || allowedClasses.has(k)) {
      lvSel.innerHTML+=`<option value="${k}" ${S.lv.has(k)?'selected':''}>${v}</option>`;
    }
  });

  // Clean up selected class if it's no longer allowed
  if(allowedClasses && S.lv.size > 0) {
    S.lv.forEach(k => {
      if(!allowedClasses.has(k)) S.lv.delete(k);
    });
  }
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
        const pillText = isMultiDay ? `${e.t} (starts)` : e.t;
        g += `<div class="event-pill ${isMultiDay ? 'span-cont' : ''}" style="--c:var(--${tk(e)})" title="${TN[tk(e)]}: ${e.t}">
                ${pillText}
              </div>`;
      } else {
        g += `<div class="event-pill span-cont" style="--c:var(--${tk(e)}); opacity: 0.75;" title="Continuing: ${e.t}">
                ${e.t}
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
        <span>${e.t}${e.cu||e.ed?` <em class="mine">${e.cu?'added by you':'edited'}</em>`:''}<button class="chip del" data-edit="${e.id}" style="color:inherit">Edit</button><button class="chip del" data-del="${e.id}">Remove</button></span>
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
  const matches = E.filter(e => passBaseFilter(e) && e.t.toLowerCase().includes(val)).slice(0, 8);

  if(!matches.length){
    suggestionsBox.innerHTML = '<div class="suggestion-item"><span class="suggestion-title" style="color:var(--mute)">No matching calendar events</span></div>';
  } else {
    suggestionsBox.innerHTML = matches.map(e => `
      <div class="suggestion-item" data-id="${e.id}">
        <span class="suggestion-title">${e.t}</span>
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
    S.t=new Set(['A','X','H','E','S']); S.st=new Set(['OL','M']); S.cp.clear(); S.lv.clear(); S.q=''; $('q').value='';
    suggestionsBox.classList.remove('open');
  }
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

/* STEP 15 | WHAT HAPPENS WHEN YOU CHANGE a dropdown (Stream, Campus, Class) or the date picker. */
document.addEventListener('change',e=>{
  if(e.target.id==='stSel'){
    const v=e.target.value;
    S.st = (v==='ALL') ? new Set(['OL','M']) : new Set([v]);
    S.cp.clear(); draw();
  }
  if(e.target.id==='cpSel'){ S.cp.clear(); if(e.target.value) S.cp.add(e.target.value); draw(); }
  if(e.target.id==='lvSel'){ S.lv.clear(); if(e.target.value) S.lv.add(e.target.value); draw(); }
});

/* PART D: ADD / EDIT / PRINT / IMPORT-EXPORT. The rest of this script adds the extra buttons in the button row. */
/* ===================== ADD-ONS (add event, print/download, next-year setup) ===================== */
/* STEP 16 | DATE AND FILE HELPERS for the buttons below: md writes a date as 1015, dl downloads a file, openD opens a pop-up window. */
const md=d=>String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');
const ymd=d=>d.getFullYear()+md(d);
const dlg=$('dlg'),openD=h=>{dlg.innerHTML=h;dlg.showModal()};
const dl=(name,txt,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;document.body.appendChild(a);a.click();a.remove()};
/* STEP 17 | PRINT AND DOWNLOAD BUILDERS. They prepare the printable list, the Excel (CSV) file and the calendar (.ics) file from the events currently shown. */
const fsum=()=>[S.st.size<2?[...S.st].map(x=>x==='OL'?'O Level':'Matric').join(''):'',[...S.cp].map(c=>CN[c]).join(', '),[...S.lv].map(l=>'Classes '+LV[l]).join(', '),S.t.size<5?[...S.t].map(k=>TN[k]).join(' / '):'',S.q?'Search: '+S.q:''].filter(Boolean).join(' · ')||'All streams, campuses and classes';
const scoped=sc=>{const f=new Date(S.c.getFullYear(),S.c.getMonth(),1),l=new Date(S.c.getFullYear(),S.c.getMonth()+1,0);return E.filter(e=>pass(e)&&(sc==='year'||(+e.e>=+f&&+e.s<=+l))).sort((a,b)=>a.s-b.s)};
const monthName=()=>S.c.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
const who=e=>(e.c.length?e.c.map(c=>CN[c]).join(', '):'All')+(e.lv?' · Classes '+[...e.lv].map(l=>LV[l]).join(', '):'');
const rng=(e,w)=>+e.s==+e.e?fm(e.s,w):fm(e.s)+' – '+fm(e.e);
const listHTML=(evs,title)=>{let h=`<h1>${title}</h1><p class="psub">${fsum()} · printed ${fm(TODAY)} ${TODAY.getFullYear()}</p>`,cur='';
  evs.forEach(e=>{const m=e.s.toLocaleDateString('en-GB',{month:'long',year:'numeric'});if(m!==cur){if(cur)h+='</tbody></table>';cur=m;h+=`<h2>${m}</h2><table><thead><tr><th>Date</th><th>Event</th><th>Type</th><th>Applies to</th></tr></thead><tbody>`}
    h+=`<tr><td>${rng(e,1)}</td><td>${e.t}</td><td>${TN[e.k]}</td><td>${who(e)}</td></tr>`});
  return h+(cur?'</tbody></table>':'<p>No events match these filters.</p>')};
const q=t=>'"'+dec(t).replace(/"/g,'""')+'"';
const csv=evs=>'\ufeff'+['Start,End,Event,Type,Stream,Applies to'].concat(evs.map(e=>[ymd(e.s).replace(/(\d{4})(\d\d)(\d\d)/,'$1-$2-$3'),ymd(e.e).replace(/(\d{4})(\d\d)(\d\d)/,'$1-$2-$3'),q(e.t),TN[e.k],strs(e).length>1?'Both':strs(e)[0],q(who(e))].join(','))).join('\r\n');
const ics=evs=>{const x=t=>dec(t).replace(/[\\;,]/g,'\\$&').replace(/\n/g,'\\n');return 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//HHS Calendar//EN\r\n'+evs.map(e=>`BEGIN:VEVENT\r\nUID:${e.id}-${ymd(e.s)}@hhs-calendar\r\nDTSTAMP:${ymd(TODAY)}T000000Z\r\nDTSTART;VALUE=DATE:${ymd(e.s)}\r\nDTEND;VALUE=DATE:${ymd(addD(e.e,1))}\r\nSUMMARY:${x(e.t)}\r\nCATEGORIES:${TN[e.k]}\r\nDESCRIPTION:${x(who(e))}\r\nEND:VEVENT\r\n`).join('')+'END:VCALENDAR\r\n'};
/* STEP 18 | THE POP-UP WINDOWS. addForm = Add/Edit event, printForm = Print / Download, adminForm = Import / Export events. To change wording in a pop-up, edit the text here. */
const checks=(n,o)=>`<div class="checks">${Object.entries(o).map(([c,v])=>`<label><input type="checkbox" name="${n}" value="${c}"> ${v}</label>`).join('')}</div>`;
const addForm=()=>`<form method="dialog" id="addF"><h3>Add an event</h3><input type="hidden" name="eidx" value=""><input type="hidden" name="borig" value="">
<div class="f"><label>Event title</label><input name="t" required maxlength="120"></div>
<div class="f2"><div class="f"><label>Start date</label><input type="date" name="s" required min="${Y0}-07-01" max="${Y0+1}-06-30"></div><div class="f"><label>End date (optional)</label><input type="date" name="e" min="${Y0}-07-01" max="${Y0+1}-06-30"></div></div>
<div class="f"><label>Type</label><select name="k">${Object.entries(TN).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></div>
<div class="f"><label>Stream</label><select name="st"><option value="">Both streams</option><option value="OL">O Level</option><option value="M">Matric</option></select></div>
<div class="f"><label>Campuses (none ticked = all)</label>${checks('c',CN)}</div>
<div class="f"><label>Classes (none ticked = all)</label>${checks('lv',LV)}</div>
<label><input type="checkbox" name="we"> Include Saturdays and Sundays in a date range</label>
<p class="hint">Saved in this browser only. To make it permanent for everyone, use Import / Export events, then "Download new calendar file" with the same year.</p>
<div class="acts"><button class="chip" value="cancel" formnovalidate>Cancel</button><button class="chip" value="ok">Save event</button></div></form>`;
const printForm=()=>`<form method="dialog"><h3>Print or download</h3><p class="hint">Uses your current filters: ${fsum()}</p>
<div class="f"><label>What to include</label><select id="pScope"><option value="screen">Print exactly what is on screen (current view)</option><option value="month">List of ${monthName()}</option><option value="year">List of the whole year</option></select></div>
<p class="hint">Excel (CSV) and Calendar (.ics) files follow the same choice. Choose "Save as PDF" in the print window to get a PDF.</p>
<div class="acts"><button class="chip" value="cancel">Close</button><button class="chip" type="button" data-act="csv">Excel (CSV)</button><button class="chip" type="button" data-act="ics">Calendar (.ics)</button><button class="chip" type="button" data-act="doprint">Print / PDF</button></div></form>`;
const adminForm=()=>`<form method="dialog"><h3>Import / Export events</h3><p class="hint">Showing academic year ${Y0}–${String(Y0+1).slice(2)}. Anything you upload or add goes into this year.</p>
<h4>Step 1. Create the data file for a new year</h4>
<div class="f"><label>Academic year starting</label><input type="number" id="nY" value="${Y0+1}" min="${Y0+1}" max="${Y0+10}"></div>
<label><input type="checkbox" id="nB"> Copy this year's calendar forward as a starting point (dates move by whole weeks; holidays are marked "(verify date)" because Eid, Chehlum and Ramazan change every year)</label><br>
<label><input type="checkbox" id="nC" checked> Include my added events and my edits/removals</label>
<div class="acts"><button class="chip" type="button" data-act="newfile">Download new-year files</button></div>
<p class="hint">You get two files: the year's data file and an updated years.js. Put both in the data folder of your site (see README), then pick the new year in the Academic year list.</p>
<h4>Step 2. Add events in bulk (pick that year first)</h4>
<div class="acts" style="justify-content:flex-start"><button class="chip" type="button" data-act="tpl">1. Download Excel template</button><label class="chip">2. Upload filled Excel / CSV<input type="file" id="xlF" accept=".xlsx,.xls,.csv" hidden></label><label class="chip">Or upload a PDF calendar<input type="file" id="pdfF" accept=".pdf" hidden></label></div>
<p class="hint">Fill the template (a sheet explains every column), save it and upload it. A PDF in the same grid layout as the school calendar also works. You will see a review list to correct or untick rows before anything is saved.</p>
<h4>Step 3. Make it permanent</h4>
<div class="acts" style="justify-content:flex-start"><button class="chip" type="button" data-act="savefile">Download data file for ${Y0}–${String(Y0+1).slice(2)} with all changes</button><button class="chip" type="button" data-act="expX">My added events (Excel)</button><button class="chip" type="button" data-act="rstO">Restore original events</button><button class="chip del" type="button" data-act="clrC">Remove all my added events</button></div>
<p class="hint">Replace the old data file with the downloaded one, so everyone sees the changes.</p>
<div class="acts"><button class="chip" value="cancel">Close</button></div></form>`;
/* STEP 19 | DATA-FILE BUILDER. toJSON turns an event back into a data-file entry, shifted by whole weeks (n years) for a new year; holidays get (verify date). dataJS / yearsJS write the two files you download. */
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const toJSON=(e,n)=>{const o={d:iso(addD(e.s,364*n))};if(+e.e>+e.s){o.e=iso(addD(e.e,364*n));if(e.all)o.we=1}o.t=dec(e.t)+(n&&e.k==='H'?' (verify date)':'');o.k=e.k;if(e.st)o.st=e.st;if(e.c.length)o.c=e.c;if(e.lv)o.lv=e.lv;return o};
const lab=y=>y+'\u2013'+String(y+1).slice(2);
const dataJS=(id,y,evs)=>'/* HHS Calendar DATA for academic year '+id+'. One event per line: d start date, e end date, we 1 = weekends included, t title, k type (A X H E S), st stream (OL/M), c campuses, lv class letters. */\nHHS.add({id:"'+id+'",start:'+y+',label:"'+lab(y)+'",events:[\n'+evs.sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0).map(o=>JSON.stringify(o)).join(',\n')+'\n]});\n';
const yearsJS=(id,y)=>'/* LIST OF AVAILABLE YEARS. One line per year. */\nwindow.HHS={years:[\n'+[...HHS.years,{id,start:y,label:lab(y),file:id+'.js'}].sort((a,b)=>a.start-b.start).map(o=>JSON.stringify(o)).join(',\n')+'\n],data:{},add:function(d){this.data[d.id]=d}};\n';
const printNow=cls=>{dlg.close();document.body.classList.add(cls);setTimeout(()=>window.print(),80)};
addEventListener('afterprint',()=>document.body.classList.remove('plist','pscreen'));
/* STEP 20 | BUTTON ACTIONS for Remove, Edit, Today, + Add event, Print / Download, Import / Export, Download new file, Restore original events and Remove all my added events. */
document.addEventListener('click',ev=>{
  const del=ev.target.closest('[data-del]');
  if(del){const e=E.find(x=>x.id==del.dataset.del);if(e&&confirm('Remove "'+dec(e.t)+'"?'+(e.cu?'':' You can bring it back with "Restore original events" in Import / Export events.'))){if(e.cu){const i=CUS.indexOf(e.raw);if(i>-1)CUS.splice(i,1);saveC()}else{OVR[e.orig]=null;saveO()}rebuild();draw()}return}
  const ed=ev.target.closest('[data-edit]');
  if(ed){const e=E.find(x=>x.id==ed.dataset.edit);if(e){openD(addForm());const f=$('addF'),iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    f.querySelector('h3').textContent='Edit event';f.eidx.value=e.cu?CUS.indexOf(e.raw):'';f.borig.value=e.cu?'':e.orig;f.t.value=dec(e.t);f.s.value=iso(e.s);f.e.value=+e.e>+e.s?iso(e.e):'';f.k.value=e.k;f.st.value=e.st;f.we.checked=e.all;
    f.querySelectorAll('[name=c]').forEach(i=>i.checked=e.c.includes(i.value));f.querySelectorAll('[name=lv]').forEach(i=>i.checked=e.lv.includes(i.value))}return}
  const b=ev.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,sc=($('pScope')||{}).value||'month';
  if(a==='today'){S.c=TODAY<new Date(Y0,6,1)||TODAY>new Date(Y0+1,5,30)?new Date(Y0,6,1):TODAY;draw()}
  else if(a==='add')openD(addForm());else if(a==='print')openD(printForm());else if(a==='admin')openD(adminForm());
  else if(a==='doprint'){if(sc==='screen')printNow('pscreen');else{$('printArea').innerHTML=listHTML(scoped(sc),'HHS Calendar '+Y0+'–'+String(Y0+1).slice(2)+(sc==='month'?' · '+monthName():''));printNow('plist')}}
  else if(a==='csv')dl('HHS-calendar-'+(sc==='year'?'year':md(S.c).slice(0,2))+'.csv',csv(scoped(sc==='year'?'year':'month')),'text/csv');
  else if(a==='ics')dl('HHS-calendar.ics',ics(scoped(sc==='year'?'year':'month')),'text/calendar');
  else if(a==='tpl')tpl();else if(a==='expX')expX();else if(a==='doimp')doImp();else if(a==='closeD')dlg.close();
  else if(a==='newfile'||a==='savefile'){const sv=a==='savefile',n=sv?0:Math.max(1,+$('nY').value-Y0),inc=sv||$('nC').checked,cp=sv\vert{}\vert{}$('nB').checked,y=Y0+n,id=y+'-'+String(y+1).slice(2);
    dl(id+'.js',dataJS(id,y,E.filter(e=>e.cu?inc:cp).map(e=>toJSON(e,n))),'text/javascript');
    if(!sv&&!HHS.years.some(x=>x.id===id))setTimeout(()=>dl('years.js',yearsJS(id,y),'text/javascript'),500);
    if(sv&&(CUS.length||Object.keys(OVR).length)&&confirm('Your changes are now inside the downloaded data file. After you replace the old file with it, the copies saved in this browser would show twice. Clear them now?')){CUS=[];OVR={};saveC();saveO();rebuild();dlg.close();draw()}}
  else if(a==='rstO'){const n=Object.keys(OVR).length;if(!n)alert('Nothing to restore: no built-in event has been edited or removed.');else if(confirm('Undo all edits and removals of the school\'s original events ('+n+')? Events you added are kept.')){OVR={};saveO();rebuild();dlg.close();draw()}}
  else if(a==='clrC'&&confirm('Remove all events you added in this browser?')){CUS=[];saveC();rebuild();dlg.close();draw()}
});
/* STEP 21 | SAVING THE ADD / EDIT FORM. Checks the dates, builds the event line and saves it. */
document.addEventListener('submit',ev=>{
  if(ev.target.getAttribute('id')!=='addF'||(ev.submitter&&ev.submitter.value==='cancel'))return;
  const f=new FormData(ev.target),s0=new Date(f.get('s')+'T00:00'),en=f.get('e')?new Date(f.get('e')+'T00:00'):s0;
  if(en<s0){ev.preventDefault();alert('The end date is before the start date.');return}
  const raw=md(s0)+(+en>+s0?(f.get('we')?'+':'-')+md(en):'')+'|'+f.get('t').replace(/\|/g,'/').trim()+'|'+f.get('k')+'|'+f.get('st')+'|'+f.getAll('c').join(',')+'|'+f.getAll('lv').join('');
  const eid=f.get('eidx'),bo=f.get('borig');if(bo){OVR[bo]=raw;saveO()}else{if(eid!==''&&CUS[+eid]!==undefined)CUS[+eid]=raw;else CUS.push(raw);saveC()}rebuild();S.c=new Date(s0.getFullYear(),s0.getMonth(),1);draw()});

/* PART E: EXCEL AND PDF UPLOAD. Both end in the Review screen so nothing is saved by mistake. */
/* ===== BULK UPLOAD: Excel/CSV template and PDF reader (both end in a review screen) ===== */
const loadJS=u=>new Promise((ok,no)=>{const x=document.createElement('script');x.src=u;x.onload=ok;x.onerror=()=>no(new Error('Could not load '+u+'. Check your internet connection.'));document.head.appendChild(x)});
/* STEP 22 | EXCEL TEMPLATE. Creates the downloadable template (column names, 3 sample rows, an Instructions sheet) and the export of your added events. To add a column or change the sample rows, edit here. */
const HEAD=['Start date (DD/MM/YYYY)','End date (optional)','Event title','Type','Stream','Campuses','Classes','Include weekends (Yes/No)'];
const csvLine=r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',');
const tpl=async()=>{const smp=[['15/10/'+Y0,'','Science Fair','Event','Both','OLG, OLC','III-V, VI-VIII','No'],['09/11/'+Y0,'13/11/'+Y0,'Unit Tests','Exams','Matric','','VI-VIII','No'],['23/03/'+(Y0+1),'','Pakistan Day','Holiday','Both','','','No']];
 const ins=[['HOW TO FILL THE EVENTS SHEET'],['Delete the 3 sample rows, then add one event per row.'],['Dates: DD/MM/YYYY or a normal Excel date. Date must fall between 1 Jul '+Y0+' and 30 Jun '+(Y0+1)+'.'],['End date: leave empty for a one-day event.'],[''],['Type (choose one)',...Object.values(TN)],['Stream (choose one)','Both','O Level','Matric'],['Campuses','Leave empty for all campuses, or type names separated by commas:',...Object.values(CN)],['Classes','Leave empty for all classes, or type separated by commas:',...Object.values(LV)],['Include weekends','Yes = a date range also covers Saturdays and Sundays. Default No.']];
 try{await loadJS('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');const wb=XLSX.utils.book_new(),w1=XLSX.utils.aoa_to_sheet([HEAD,...smp]);w1['!cols']=[22,18,44,16,10,26,22,22].map(w=>({wch:w}));XLSX.utils.book_append_sheet(wb,w1,'Events');XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(ins),'Instructions');XLSX.writeFile(wb,'HHS-events-template.xlsx')}
 catch(x){dl('HHS-events-template.csv','\ufeff'+[HEAD,...smp].map(csvLine).join('\r\n'),'text/csv');alert('The Excel library could not load, so a CSV template was downloaded instead. Open it in Excel and save as CSV when done.')}};
const expX=async()=>{const rows=CUS.map(r=>parse(r,0,1)).map(e=>[fm(e.s)+' '+e.s.getFullYear(),+e.e>+e.s?fm(e.e)+' '+e.e.getFullYear():'',dec(e.t),TN[e.k],e.st?SN2[e.st]:'Both',e.c.map(c=>CN[c]).join(', '),[...e.lv].map(l=>LV[l]).join(', '),e.all?'Yes':'No']);
 try{await loadJS('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([HEAD,...rows]),'Events');XLSX.writeFile(wb,'my-added-events.xlsx')}catch(x){dl('my-added-events.csv','\ufeff'+[HEAD,...rows].map(csvLine).join('\r\n'),'text/csv')}};
const SN2={OL:'O Level',M:'Matric'};
/* STEP 23 | READING EXCEL / CSV. Converts each row of the uploaded sheet into an event: reads the date in several formats, matches Type / Stream / Campus / Class names, and flags problems (missing date, outside the year, duplicate). */
const nm=t=>String(t).toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,'');
const toDate=v=>{if(v instanceof Date)return isNaN(v)?null:new Date(v.getFullYear(),v.getMonth(),v.getDate());
 if(typeof v==='number')return new Date(new Date(Math.round((v-25569)*864e5)).getUTCFullYear(),new Date(Math.round((v-25569)*864e5)).getUTCMonth(),new Date(Math.round((v-25569)*864e5)).getUTCDate());
 v=String(v||'').trim();let m=v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return new Date(+m[1],m[2]-1,+m[3]);
 m=v.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);if(m)return new Date(m[3].length==2?2000+ +m[3]:+m[3],m[2]-1,+m[1]);
 const d=new Date(v);return isNaN(d)?null:new Date(d.getFullYear(),d.getMonth(),d.getDate())};
const csvParse=t=>{const rows=[];let r=[],c='',q=0;t=t.replace(/^\ufeff/,'');for(let i=0;i<t.length;i++){const ch=t[i];if(q){if(ch=='"'){if(t[i+1]=='"'){c+='"';i++}else q=0}else c+=ch}else if(ch=='"')q=1;else if(ch==','||ch==';'){r.push(c);c=''}else if(ch=='\n'){r.push(c);rows.push(r);r=[];c=''}else if(ch!='\r')c+=ch}if(c||r.length){r.push(c);rows.push(r)}return rows};
const inYear=(d)=>d>=new Date(Y0,6,1)&&d<=new Date(Y0+1,5,30);
const mkItem=(o)=>{const w=[];if(!o.s)return{err:'Start date missing or unreadable',...o,t:o.t||'',c:o.c||[],lv:o.lv||''};if(!o.t)return{err:'Event title missing',...o,c:o.c||[],lv:o.lv||''};
 if(!o.e||o.e<o.s)o.e=o.s;if(!inYear(o.s)||!inYear(o.e))w.push('Outside '+Y0+'–'+String(Y0+1).slice(2));
 const raw=md(o.s)+(+o.e>+o.s?(o.all?'+':'-')+md(o.e):'')+'|'+o.t.replace(/\|/g,'/')+'|'+o.k+'|'+o.st+'|'+o.c.join(',')+'|'+o.lv;
 if(E.some(x=>x.raw===raw))w.push('Already in calendar');return{...o,raw,warn:w.join('; ')}};
const rowsToItems=rows=>{const out=[];rows.forEach((r,i)=>{if(!r||r.every(x=>x===''||x==null))return;if(i===0&&/start|date/i.test(String(r[0]))&&!toDate(r[0]))return;
 const [a,b,t,ty,st,cp,lv,we]=r,notes=[],c=[];String(cp||'').split(/[,;\/]+/).map(x=>x.trim()).filter(Boolean).forEach(x=>{const k=Object.keys(CN).find(k=>nm(k)===nm(x)||nm(CN[k])===nm(x));k?c.push(k):notes.push('Unknown campus "'+x+'"')});
 const lvs=new Set();String(lv||'').split(/[,;\/]+/).map(x=>x.trim()).filter(Boolean).forEach(x=>{const n=nm(x),k=Object.keys(LV).find(k=>n===k||n===nm(LV[k]))||(/^(pre|pn|nur|prep)/.test(n)?'a':'');k?lvs.add(k):notes.push('Unknown class "'+x+'"')});
 const tn=nm(ty||''),k=tn?(tn[0]==='a'?'A':tn[0]==='x'||tn.startsWith('ex')?'X':tn[0]==='h'?'H':tn[0]==='e'?'E':'S'):'E',sn=nm(st||''),ss=sn[0]==='o'?'OL':sn[0]==='m'?'M':'';
 const it=mkItem({s:toDate(a),e:toDate(b),t:String(t||'').trim(),k,st:ss,c,lv:[...lvs].join(''),all:/^y/i.test(String(we||'').trim()),src:'Row '+(i+1)});if(notes.length)it.warn=(it.warn?it.warn+'; ':'')+notes.join('; ');out.push(it)});return out};
/* STEP 24 | GUESSING FROM WORDS (used for PDF). cls picks the event type from words in the title (e.g. 'Result' becomes Academic, 'Exam' becomes Exams). detC finds campuses, detL finds class groups, detS finds O Level / Matric. Add words here to improve the guesses. */
const cls=t=>/holiday|\beid\b|chehlum|ramaz|ramzan|ashra|winter break|^(independence|pakistan|labou?r|defence|kashmir|quaid-?e-?azam|iqbal|youm[\w -]*|republic) day$|rabi|muharram|ashura|christmas|good friday/i.test(t)?'H':/submission|submit|training|joining|induction|orientation|QEC|rejoin|last working|progress report|printing/i.test(t)?'S':/sports|tournament|futsal|cricket|basketball|throwball|badminton/i.test(t)?'S':/admission|result|ptm|parent|promotion|new classes|academic year|photograph|reopen|revision|review/i.test(t)?'A':/exam|test|practical|mock|assessment|viva|quiz|islamiyat|sindhi|social studies|computer|namaz|nazra/i.test(t)?'X':'E';
const detC=t=>{const c=new Set();if(/pechs/i.test(t))c.add('PEC');else if(/\bIMC\b|jamshed/i.test(t))c.add('IMC');if(/\bOLG\b|gulshan/i.test(t))c.add('OLG');if(/\bOLC\b|clifton/i.test(t))c.add('OLC');if(/\bOLN\b/.test(t))c.add('OLN');if(/\bOLS\b|society/i.test(t))c.add('OLS');if(/senior school/i.test(t))c.add('SSC');if(/johar/i.test(t))c.add('JOH');if(/\bTLC\b/.test(t))c.add('TLC');if(/fast ?track/i.test(t))c.add('FT');return[...c]};
const RM={I:1,II:2,III:3,IV:4,V:5,VI:6,VII:7,VIII:8,IX:9,X:10,XI:11,XII:12};
const detL=t=>{const L=new Set(),R='(XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)',re=new RegExp('\\b'+R+'\\s*(?:-|–|to|&|and)\\s*'+R+'\\b','g');let m;while((m=re.exec(t))){for(let n=RM[m[1]];n<=RM[m[2]];n++)L.add(n<3?'b':n<6?'c':n<9?'d':'e')}if(/\bPN\b|\bNur\b|\bPrep\b|pre-?school/i.test(t))L.add('a');return[...L].join('')};
const detS=t=>{const o=/\(OL\)|\bOL\b|O ?Level/.test(t),m=/\(M\)|\bM\b|Matric|AKU/.test(t);return o&&!m?'OL':m&&!o?'M':''};
/* STEP 25 | PDF READER. Loads the PDF tool, finds the Monday-Sunday header, the month and year, the day numbers, and the text inside each day box, then joins repeated days into one date range. */
const loadPdf=async()=>{if(window.pdfjsLib)return;const B='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';await loadJS(B+'pdf.min.js');const w=await (await fetch(B+'pdf.worker.min.js')).text();pdfjsLib.GlobalWorkerOptions.workerSrc=URL.createObjectURL(new Blob([w],{type:'text/javascript'}))};
const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
let PDFDBG={};
const pdfCells=pages=>{const cells=[],seen=new Set(),DAY=/^(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?$/i,MR=new RegExp('\\b('+MON.join('|')+')\\b','i');PDFDBG={pages:pages.length,hdr:0,rows:0};
 pages.forEach(W0=>{const cand=W0.filter(w=>DAY.test(w.t)),ln={};cand.forEach(w=>{const k=Math.round(w.y/4);(ln[k]=ln[k]||[]).push(w)});
  const hd=(Object.values(ln).find(l=>l.length>=7)||[]).sort((a,b)=>a.x-b.x);if(hd.length<7)return;PDFDBG.hdr++;
  const xs=hd.slice(0,7).map(w=>w.x),hy=hd[0].y,near=x=>Math.min(...xs.map(c=>Math.abs(c-x))),top=W0.filter(w=>w.y<hy),mo=top.map(w=>w.t.match(MR)).find(Boolean),yr=top.map(w=>w.t.match(/\b(20\d\d)\b/)).find(Boolean);if(!mo||!yr)return;
  const mi=MON.findIndex(x=>x.toLowerCase()===mo[1].toLowerCase()),W=[];
  W0.forEach(w=>{const m=w.y>hy&&near(w.x)<8&&w.t.match(/^(\d{1,2})\s+(\S.*)$/);if(m){W.push({...w,t:m[1],w:12});W.push({...w,t:m[2],x:w.x+12,w:w.w-12})}else W.push(w)});
  const col=x=>{let c=-1;xs.forEach((v,i)=>{if(x>=v-12)c=i});return c},nums=W.filter(w=>/^\d{1,2}$/.test(w.t)&&w.y>hy&&near(w.x)<16),nt=W.find(w=>/^Notes:?$/.test(w.t)&&w.y>hy),cl=[];
  [...new Set(nums.map(n=>Math.round(n.y)))].sort((a,b)=>a-b).forEach(y=>{const l=cl[cl.length-1],ns=nums.filter(n=>Math.round(n.y)===y);if(l&&y-l.y<=5)l.n.push(...ns);else cl.push({y,n:ns})});
  const good=cl.filter(r=>!(nt&&Math.abs(nt.y-r.y)<6)&&(r.n.length>=3||r.n.some(n=>col(n.x+n.w/2)===0))),rows=good.map(r=>r.y);if(!rows.length)return;PDFDBG.rows++;
  const f=good[0].n.slice().sort((a,b)=>a.x-b.x)[0],n0=+f.t,c0=col(f.x+f.w/2),d0=new Date(+yr[1],n0<8?mi:mi-1,n0-c0),ns=new Set(nums),box={};
  W.forEach(w=>{if(ns.has(w))return;const ci=col(w.x+w.w/2);let ri=-1;rows.forEach((r,i)=>{if(w.y>r+3)ri=i});if(ci<0||ri<0||(nt&&w.y>=nt.y-4))return;(box[ri*7+ci]=box[ri*7+ci]||[]).push(w)});
  Object.keys(box).forEach(k=>{const t=box[k].sort((a,b)=>Math.round(a.y/4)-Math.round(b.y/4)||a.x-b.x).map(w=>w.t).join(' ').replace(/\s+/g,' ').trim();if(!t||/Notes|KEY-|COLOUR/.test(t))return;
   const d=new Date(d0.getFullYear(),d0.getMonth(),d0.getDate()+ +k),id=+d+t;if(seen.has(id))return;seen.add(id);
   (/^1\.\s*\S/.test(t)?t.split(/\s+(?=[2-9]\.\s*\S)/).map(x=>x.replace(/^\d\.\s*/,'')):[t]).forEach(x=>x&&cells.push({d,t:x}))})});
 cells.sort((a,b)=>a.t<b.t?-1:a.t>b.t?1:a.d-b.d);const g=[];
 cells.forEach(c=>{const l=g[g.length-1],key=nm(c.t);if(l&&nm(l.t)===key){let ok=true;for(let d=addD(l.e,1);d<c.d;d=addD(d,1))if(d.getDay()%6)ok=false;if(ok&&c.d>=l.e){if(c.d.getDay()%6==0)l.we=1;l.e=c.d;return}}g.push({t:c.t,s:c.d,e:c.d,we:c.d.getDay()%6==0})});
 return g.sort((a,b)=>a.s-b.s).map(x=>mkItem({s:x.s,e:x.e,all:x.we&&+x.e>+x.s,t:x.t,k:cls(x.t),st:detS(x.t),c:detC(x.t),lv:detL(x.t)}))};
async function pdfItems(file){await loadPdf();const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise,pages=[];
 for(let p=1;p<=pdf.numPages;p++){const tc=await (await pdf.getPage(p)).getTextContent();pages.push(tc.items.filter(i=>i.str&&i.str.trim()).map(i=>({t:i.str.trim(),x:i.transform[4],y:-i.transform[5],w:i.width||0})))}
 const r=pdfCells(pages);if(!r.length){const d=PDFDBG;throw new Error(!d.hdr?'No row of weekday names (Monday to Sunday) was found. If this PDF is a scan or picture, it cannot be read; use the Excel template instead.':!d.rows?'The weekday names were found, but no day numbers under them.':'The calendar grid was found, but it has no text in any day box, so there are no events to import.')}
 return r}
/* STEP 26 | REVIEW SCREEN. Shows the events found in the Excel/PDF file with tick boxes, an editable title and type. Nothing is saved until Import ticked events is pressed (doImp). Cancel closes it. */
let REV=[];
const showRev=(items,src)=>{REV=items;const ok=items.filter(i=>!i.err).length;
 openD(`<h3>Review before saving</h3><p class="hint">${src}: ${items.length} row(s) found. Fix a title or type if needed and untick anything that is wrong. Nothing is saved until you press Import.</p><div class="rv"><table><thead><tr><th></th><th>Date</th><th>Event</th><th>Type</th><th>Applies to</th><th>Note</th></tr></thead><tbody>`+
 items.map((it,i)=>`<tr><td><input type="checkbox" data-i="${i}" ${it.err||it.warn?'':'checked'} ${it.err?'disabled':''}></td><td>${it.s?rng(it,0)+' '+it.s.getFullYear():'?'}</td><td><input data-t="${i}" value="${esc(dec(it.t||''))}"></td><td><select data-k="${i}">${Object.entries(TN).map(([k,v])=>`<option value="${k}"${k===it.k?' selected':''}>${v}</option>`).join('')}</select></td><td>${it.c&&it.c.length||it.lv?who({c:it.c,lv:it.lv||''}):'All'}${it.st?' · '+SN2[it.st]:''}</td><td class="${it.err?'bad':'wrn'}">${it.err||it.warn||''}</td></tr>`).join('')+
 `</tbody></table></div><div class="acts"><button class="chip" type="button" data-act="closeD">Cancel</button><button class="chip" type="button" data-act="doimp" ${ok?'':'disabled'}>Import ticked events</button></div>`)};
const doImp=()=>{let n=0,first=null;REV.forEach((it,i)=>{const cb=dlg.querySelector(`[data-i="${i}"]`);if(!cb||!cb.checked||it.err)return;const t=dlg.querySelector(`[data-t="${i}"]`).value.trim(),k=dlg.querySelector(`[data-k="${i}"]`).value;if(!t)return;
  const raw=md(it.s)+(+it.e>+it.s?(it.all?'+':'-')+md(it.e):'')+'|'+t.replace(/\|/g,'/')+'|'+k+'|'+it.st+'|'+it.c.join(',')+'|'+it.lv;if(CUS.includes(raw)||E.some(x=>x.raw===raw))return;CUS.push(raw);n++;if(!first||it.s<first)first=it.s});
 saveC();rebuild();dlg.close();if(first)S.c=new Date(first.getFullYear(),first.getMonth(),1);draw();alert(n+' event(s) imported. They show "added by you" and can be edited or removed.')};
/* STEP 27 | WHEN A FILE IS CHOSEN. Decides if it is PDF, CSV or Excel, reads it and opens the Review screen. */
document.addEventListener('change',async ev=>{const f=ev.target.files&&ev.target.files[0];if(!f||(ev.target.id!=='xlF'&&ev.target.id!=='pdfF'))return;ev.target.value='';
 try{if(f.name.toLowerCase().endsWith('.pdf')){showRev([],'Reading PDF');dlg.querySelector('p').textContent='Reading the PDF, please wait…';showRev(await pdfItems(f),'PDF')}
  else if(/\.csv$/i.test(f.name))showRev(rowsToItems(csvParse(await f.text())),'CSV file');
  else{await loadJS('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');const wb=XLSX.read(await f.arrayBuffer(),{type:'array',cellDates:true});showRev(rowsToItems(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,raw:true,defval:''})),'Excel file')}}
 catch(x){dlg.close();alert('Could not read this file. '+x.message)}});
/* STEP 29 | DAY POP-UP (embed mode). Clicking a day opens a window listing everything on that day, with type, stream, campus and classes. */
document.addEventListener('click',ev=>{if(!EMBED)return;const c=ev.target.closest('[data-d]');if(!c)return;const d=new Date(+c.dataset.d),evs=E.filter(e=>pass(e)&&hit(e,d));
  openD(`<form method="dialog"><h3>${d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</h3>`+(evs.length?evs.map(e=>`<div class="dayEv" style="--c:var(--${tk(e)})"><b>${e.t}</b><small>${TN[tk(e)]} · ${rng(e,0)} · ${who(e)}${e.st?' · '+SN2[e.st]:''}</small></div>`).join(''):'<p class="hint">No events on this day with the current filters.</p>')+'<div class="acts"><button class="chip" value="cancel">Close</button></div></form>')});
/* STEP 30 | YEAR PICKER. Fills the Academic year list from data/years.js. Choosing a year reloads the page with ?year=... so each year is a clean, separate calendar. */
$('yrSel').innerHTML=HHS.years.map(y=>`<option value="${y.id}"${y.id===HHS.cur.id?' selected':''}>${y.label}</option>`).join('');
$('yrSel').onchange=e=>{location.search='?year='+e.target.value};$('ttl').textContent='HHS Academic & Event Calendar '+HHS.cur.label;document.title='HHS Academic & Event Calendar '+HHS.cur.label;
if(!HHS.data[HHS.cur.id])document.querySelector('main').insertAdjacentHTML('afterbegin','<p style="padding:12px;border:1px solid #b3261e;border-radius:8px">The data file for '+HHS.cur.label+' (data/'+HHS.cur.file+') could not be loaded. Check that it exists in the data folder.</p>');
/* STEP 28 | START-UP. Draws the calendar for the first time. Keep this line last. */
draw();
