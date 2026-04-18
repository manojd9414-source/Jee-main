// JEE 99ile Tracker — APP LOGIC

// ═══════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════
var mocks=[], done={}, studyData={}, dailyGoalHrs=8;
var arenaChapterStats = {};
var dailyArenaStats = {}; // {date:{physics:{att,corr,wrong},chemistry:{...},maths:{...},total:{att,corr,wrong}}}
var checklist = [], errorBook = [], spacedRep = {}, lecLinks = {};
var acsFilter = 'all', hmFilter = 'all';
var curSub='physics', studySec=0, studyOn=false, studyIv=null;
var curSylSub='physics', curPeriod='day';
var planSub='physics', planSelected={physics:[],chemistry:[],maths:[]}, planDone={physics:{},chemistry:{},maths:{}};
var planDateKey='';
var selDay=2;

// ═══════════════════════════════════════
// UTILS
// ═══════════════════════════════════════
function p2(n){ return String(n).padStart(2,'0'); }
function fmtHM(s){ return Math.floor(s/3600)+'h '+Math.floor((s%3600)/60)+'m'; }
function fmtHMS(s){ return p2(Math.floor(s/3600))+':'+p2(Math.floor((s%3600)/60))+':'+p2(s%60); }
function today(){ return new Date().toISOString().split('T')[0]; }

// ═══════════════════════════════════════
// QUOTES
// ═══════════════════════════════════════

(function(){
  var d=new Date(), dy=Math.floor((d-new Date(d.getFullYear(),0,0))/86400000);
  var q=QUOTES[dy%QUOTES.length];
  var days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('qtext').textContent='\u201C'+q.q+'\u201D';
  document.getElementById('qauth').textContent='\u2014 '+q.a;
  document.getElementById('qdate').textContent=days[d.getDay()]+', '+d.getDate()+' '+months[d.getMonth()]+' '+d.getFullYear();
})();

// ═══════════════════════════════════════
// COUNTDOWN
// ═══════════════════════════════════════
function selMainDate(v){ selDay=parseInt(v); }
function mTS(day){ return new Date(2026,3,day,9,0,0).getTime(); }
function tick(){
  var now=Date.now();
  var md=mTS(selDay)-now; if(md<0)md=0;
  var av=new Date(2026,4,18,9,0,0).getTime()-now; if(av<0)av=0;
  document.getElementById('md').textContent=p2(Math.floor(md/86400000));
  document.getElementById('mh').textContent=p2(Math.floor(md%86400000/3600000));
  document.getElementById('mm').textContent=p2(Math.floor(md%3600000/60000));
  document.getElementById('ms').textContent=p2(Math.floor(md%60000/1000));
  document.getElementById('ad').textContent=p2(Math.floor(av/86400000));
  document.getElementById('ah').textContent=p2(Math.floor(av%86400000/3600000));
  document.getElementById('am').textContent=p2(Math.floor(av%3600000/60000));
  document.getElementById('as2').textContent=p2(Math.floor(av%60000/1000));
}
setInterval(tick,1000); tick();

// ═══════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════
function showNav(name,btn){
  document.querySelectorAll('.sec').forEach(function(s){s.classList.remove('on');});
  document.querySelectorAll('.nav-btn').forEach(function(b){b.classList.remove('on');});
  var sec=document.getElementById('sec-'+name);
  if(sec) sec.classList.add('on');
  btn.classList.add('on');
  if(name==='syl'){renderSylChapList();updProg();}
  if(name==='timer'){renderStudyUI();renderPlanChapList();}
  if(name==='stats'){renderStats();renderArenaChapterStats();renderHeatmap();renderErrorBook();renderBadges();refreshLeaderboard();renderDailyArenaStats();}
  if(name==='home'){renderChecklist();renderBadges();renderSpacedRepReminders();}
  if(name==='tasks'){renderTasks();}
}

// ═══════════════════════════════════════
// INIT & SAVE
// ═══════════════════════════════════════
window.initApp = async function(){
  window.showStatus('loading');
  done={}; mocks=[]; studyData={}; arenaChapterStats={}; dailyArenaStats={}; checklist=[]; errorBook=[]; spacedRep={}; lecLinks={};

  if(window._isGuest){
    try{
      var raw=localStorage.getItem('jee_guest');
      if(raw){
        var obj=JSON.parse(raw);
        mocks=obj.mocks||[];
        done=obj.done||{};
        studyData=obj.studyData||{};
        arenaChapterStats=obj.arenaChapterStats||{};
        checklist=obj.checklist||[];
        errorBook=obj.errorBook||[];
        spacedRep=obj.spacedRep||{};
        lecLinks=obj.lecLinks||{};
        dailyArenaStats=obj.dailyArenaStats||{};
      }
    }catch(e){}
    dailyGoalHrs=8;
    try{var g=localStorage.getItem('jee_guest_goal');if(g)dailyGoalHrs=parseInt(g)||8;}catch(e){}
    var gi=document.getElementById('goalInp'); if(gi) gi.value=dailyGoalHrs;
    var mi=document.getElementById('mockDate'); if(mi) mi.value=today();
    window.showStatus('guest');
    buildSyl(); renderStats(); renderArenaChapterStats(); renderStudyUI(); updateStreakBadge();
    renderChecklist(); renderBadges(); renderSpacedRepReminders();
    planDateKey=today(); initPlannerToday();
    loadChaps(); loadTimerState();
    return;
  }

  try{ done=await window.FS.loadSyl(); }catch(e){}
  try{ mocks=await window.FS.loadMocksFS(); }catch(e){}
  try{ studyData=await window.FS.loadStudy(); }catch(e){}
  try{ dailyGoalHrs=await window.FS.loadGoalFS(); }catch(e){}
  try{ arenaChapterStats=await window.FS.loadArenaChapterStats(); }catch(e){}
  try{ checklist=await window.FS.loadChecklist(); }catch(e){}
  try{ errorBook=await window.FS.loadMistakes(); }catch(e){}
  try{ spacedRep=await window.FS.loadSpacedRep(); }catch(e){}
  try{ lecLinks=await window.FS.loadLecLinks(); }catch(e){}
  try{ dailyArenaStats=await window.FS.loadDailyArena(); }catch(e){}
  var gi=document.getElementById('goalInp'); if(gi) gi.value=dailyGoalHrs;
  var mi=document.getElementById('mockDate'); if(mi) mi.value=today();
  window.showStatus('synced');
  buildSyl(); renderStats(); renderArenaChapterStats(); renderStudyUI(); updateStreakBadge();
  renderChecklist(); renderBadges(); renderSpacedRepReminders();
  planDateKey=today(); initPlannerToday();
  loadChaps(); loadTimerState();
  // Update leaderboard with latest stats
  var user=window._currentUser;
  if(user){
    var totQ=0,totCorr=0;
    mocks.forEach(function(m){totQ+=m.qs||0;totCorr+=m.corr||0;});
    window.FS.updateLeaderboard(user.displayName||'JEE Aspirant',user.photoURL||'',totQ,totCorr);
  }
};

function saveLocal(){
  var uid=window._isGuest?'guest':(window._uid||null); if(!uid)return;
  try{
    localStorage.setItem('jee_'+uid, JSON.stringify({
      mocks:mocks, done:done, studyData:studyData,
      arenaChapterStats:arenaChapterStats, dailyArenaStats:dailyArenaStats,
      checklist:checklist, errorBook:errorBook, spacedRep:spacedRep, lecLinks:lecLinks
    }));
  }catch(e){}
}

// ═══════════════════════════════════════
// STUDY TIMER
// ═══════════════════════════════════════
function selSub(sub){
  curSub=sub;
  var map={physics:'ph',chemistry:'ch',maths:'ma'};
  Object.keys(map).forEach(function(s){
    var el=document.getElementById('sb'+map[s]);
    if(el) el.classList.toggle('on',s===sub);
  });
  var lbl=document.getElementById('studySubLabel');
  if(lbl) lbl.textContent=SYL[sub].name+' padh raha hai...';
}
// togStudyTimer and rstStudyTimer are defined in the Pomodoro section below
function renderStudyUI(){
  var k=today(), td=studyData[k]||{physics:0,chemistry:0,maths:0};
  var tot=(td.physics||0)+(td.chemistry||0)+(td.maths||0);
  var ph=document.getElementById('ph-time'),ch=document.getElementById('ch-time'),ma=document.getElementById('ma-time');
  if(ph) ph.textContent=fmtHM(td.physics||0);
  if(ch) ch.textContent=fmtHM(td.chemistry||0);
  if(ma) ma.textContent=fmtHM(td.maths||0);
  var pct=Math.min(100,Math.round(tot/(dailyGoalHrs*3600)*100));
  var bar=document.getElementById('goalBar'); if(bar) bar.style.width=pct+'%';
  var gv=document.getElementById('goalValDisp'); if(gv) gv.textContent=fmtHM(tot)+' / '+dailyGoalHrs+'h';
  renderWeekGraph();
}
function saveGoal(){
  var gi=document.getElementById('goalInp');
  dailyGoalHrs=parseInt(gi.value)||8;
  if(window._isGuest){try{localStorage.setItem('jee_guest_goal',dailyGoalHrs);}catch(e){};}
  else{window.FS.saveGoalFS(dailyGoalHrs);}
  renderStudyUI();
}
function renderWeekGraph(){
  var days=['S','M','T','W','T','F','S'], today2=new Date(), data=[], maxS=0;
  for(var i=6;i>=0;i--){
    var d=new Date(today2); d.setDate(today2.getDate()-i);
    var k=d.toISOString().split('T')[0];
    var td2=studyData[k]||{physics:0,chemistry:0,maths:0};
    var tot=(td2.physics||0)+(td2.chemistry||0)+(td2.maths||0);
    data.push({day:days[d.getDay()],sec:tot,isToday:k===today()});
    if(tot>maxS) maxS=tot;
  }
  var g=document.getElementById('weekGraph'); if(!g)return;
  g.innerHTML='';
  data.forEach(function(wd){
    var h=maxS>0?Math.max(6,Math.round(wd.sec/maxS*100)):6;
    var wrap=document.createElement('div'); wrap.className='wbw';
    wrap.innerHTML='<div class="wbb"><div class="wbf" style="height:'+h+'%;background:'+(wd.isToday?'#4f46e5':'#a5b4fc')+'"></div></div>'
      +'<div class="wbd" style="color:'+(wd.isToday?'#4f46e5':'var(--text3)')+'">'+wd.day+'</div>'
      +'<div class="wbh">'+(wd.sec>0?(Math.round(wd.sec/360)/10)+'h':'')+'</div>';
    g.appendChild(wrap);
  });
}

// ═══════════════════════════════════════
// SYLLABUS
// ═══════════════════════════════════════
function sylTab(sub){
  curSylSub=sub;
  ['physics','chemistry','maths'].forEach(function(s){
    var b=document.getElementById('stab-'+(s==='physics'?'ph':s==='chemistry'?'ch':'ma'));
    if(b) b.classList.toggle('on',s===sub);
  });
  renderSylChapList();
}
function renderSylChapList(){
  var container=document.getElementById('sylChapList'); if(!container)return;
  var sk=curSylSub;
  var dc=sk==='physics'?'dph':sk==='chemistry'?'dch':'dma';
  var html='';
  SYL[sk].chapters.forEach(function(ch,i){
    var key=sk+i, isDone=!!done[key];
    html+='<div class="syl-ch-item'+(isDone?' '+dc:'')+'" onclick="togCh(\''+sk+'\','+i+')">'
      +'<div class="syl-tick">'+(isDone?'&#10003;':'')+'</div>'
      +'<div class="syl-ch-num">'+(i+1)+'</div>'
      +'<div class="syl-ch-name">'+ch+'</div>'
      +'</div>';
  });
  container.innerHTML=html;
}
function buildSyl(){ updProg(); renderSylChapList(); }
function togCh(sk,i){
  var key=sk+i; done[key]=!done[key];
  // Spaced repetition: record when chapter was completed
  if(done[key]){ spacedRep[key]={doneDate:today(),intervals:[3,7,15,30],nextIdx:0}; }
  else { delete spacedRep[key]; }
  renderSylChapList(); updProg(); saveLocal();
  window.FS.saveSyl(done);
  if(!window._isGuest) window.FS.saveSpacedRep(spacedRep);
  renderSpacedRepReminders();
}
function updProg(){
  var tot=0,dn=0,sub={};
  Object.keys(SYL).forEach(function(sk){
    var sd=0,st=SYL[sk].chapters.length;
    for(var i=0;i<st;i++){tot++;if(done[sk+i]){dn++;sd++;}}
    sub[sk]={dn:sd,tot:st};
  });
  var pct=tot?Math.round(dn/tot*100):0;
  var ep=document.getElementById('sylPct'); if(ep) ep.textContent=pct+'%';
  var eb=document.getElementById('sylBar'); if(eb) eb.style.width=pct+'%';
  var ec=document.getElementById('sylCnt'); if(ec) ec.textContent=dn+'/'+tot;
  var sbars=document.getElementById('sylSubBars');
  if(sbars){
    var cols={physics:'var(--blue)',chemistry:'var(--orange)',maths:'var(--green)'};
    var labs={physics:'⚡ Physics',chemistry:'🧪 Chemistry',maths:'📐 Maths'};
    var html='';
    Object.keys(SYL).forEach(function(sk){
      var d2=sub[sk],p2v=d2.tot?Math.round(d2.dn/d2.tot*100):0;
      html+='<div class="sub-bar-row">'
        +'<div class="sub-bar-lbl" style="color:'+cols[sk]+'">'+labs[sk]+'</div>'
        +'<div class="sub-bar-bg"><div class="sub-bar-fill" style="width:'+p2v+'%;background:'+cols[sk]+'"></div></div>'
        +'<div class="sub-bar-pct" style="color:'+cols[sk]+'">'+p2v+'%</div>'
        +'</div>';
    });
    sbars.innerHTML=html;
  }
}

// ═══════════════════════════════════════
// CHAPTER PLANNER
// ═══════════════════════════════════════
function initPlannerToday(){
  var uid=window._isGuest?'guest':(window._uid||null); if(!uid)return;
  try{
    var raw=localStorage.getItem('jee_plan_'+uid+'_'+planDateKey);
    if(raw){var obj=JSON.parse(raw);planSelected=obj.selected||{physics:[],chemistry:[],maths:[]};planDone=obj.done||{physics:{},chemistry:{},maths:{}};}
    else{planSelected={physics:[],chemistry:[],maths:[]};planDone={physics:{},chemistry:{},maths:{}};}
  }catch(e){planSelected={physics:[],chemistry:[],maths:[]};planDone={physics:{},chemistry:{},maths:{}};}
  switchPlanSub(planSub);
}
function savePlanLocal(){
  var uid=window._isGuest?'guest':(window._uid||null); if(!uid)return;
  try{localStorage.setItem('jee_plan_'+uid+'_'+planDateKey,JSON.stringify({selected:planSelected,done:planDone}));}catch(e){}
}
function switchPlanSub(sub){
  planSub=sub;
  ['physics','chemistry','maths'].forEach(function(s){
    var t=document.getElementById('pt'+(s==='physics'?'ph':s==='chemistry'?'ch':'ma')); if(!t)return;
    var col=s==='physics'?'var(--blue)':s==='chemistry'?'var(--orange)':'var(--green)';
    if(s===sub){t.style.background=col;t.style.color='#fff';t.style.borderColor='transparent';}
    else{t.style.background='#fff';t.style.color='var(--text2)';t.style.borderColor='var(--border)';}
  });
  renderPlanChapList();
}
function renderPlanChapList(){
  var container=document.getElementById('planChapList'); if(!container)return;
  var chapters=SYL[planSub].chapters, selIdx=planSelected[planSub]||[];
  var sc=planSub==='physics'?'sph':planSub==='chemistry'?'sch':'sma';
  var html='';
  chapters.forEach(function(ch,i){
    var isSel=selIdx.indexOf(i)>-1;
    html+='<div class="plan-ch-item'+(isSel?' '+sc:'')+'" onclick="togglePlanChap('+i+')">'
      +'<div class="plan-chk">'+(isSel?'&#10003;':'')+'</div>'
      +'<div style="font-size:13px;font-weight:600;">'+ch+'</div>'
      +'</div>';
  });
  container.innerHTML=html;
  renderPlanSelCount();
}
function togglePlanChap(idx){
  if(!planSelected[planSub])planSelected[planSub]=[];
  var arr=planSelected[planSub], pos=arr.indexOf(idx);
  if(pos>-1){arr.splice(pos,1);if(planDone[planSub])delete planDone[planSub][idx];}
  else{arr.push(idx);}
  savePlanLocal(); renderPlanChapList(); renderPlanDoneList();
}
function renderPlanSelCount(){
  var total=0;
  Object.keys(planSelected).forEach(function(s){total+=(planSelected[s]||[]).length;});
  var el=document.getElementById('planSelCount');
  if(el){el.textContent=total===0?'Upar se chapters select karo \u261D':'&#10003; '+total+' chapters selected';el.style.color=total===0?'var(--text3)':'var(--blue)';}
  renderPlanDoneList();
}
function renderPlanDoneList(){
  var doneArea=document.getElementById('planDoneArea'),doneList=document.getElementById('planDoneList');
  if(!doneArea||!doneList)return;
  var all=[];
  ['physics','chemistry','maths'].forEach(function(s){(planSelected[s]||[]).forEach(function(idx){all.push({sub:s,idx:idx,ch:SYL[s].chapters[idx]});});});
  if(all.length===0){doneArea.style.display='none';return;}
  doneArea.style.display='block';
  var dc=0,scols={physics:'#eef2ff',chemistry:'#fff7ed',maths:'#dcfce7'},stcols={physics:'#4f46e5',chemistry:'#ea580c',maths:'#16a34a'},semj={physics:'⚡',chemistry:'🧪',maths:'📐'};
  var html='';
  all.forEach(function(item){
    var isDone=planDone[item.sub]&&planDone[item.sub][item.idx];
    if(isDone) dc++;
    html+='<div class="plan-done-item'+(isDone?' ticked':'')+'" onclick="tickPlanChap(\''+item.sub+'\','+item.idx+')">'
      +'<div class="plan-done-chk">'+(isDone?'&#10003;':'')+'</div>'
      +'<div class="plan-done-name">'+item.ch+'</div>'
      +'<span class="plan-done-sub" style="background:'+scols[item.sub]+';color:'+stcols[item.sub]+';">'+semj[item.sub]+'</span>'
      +'</div>';
  });
  doneList.innerHTML=html;
  var pct=all.length>0?Math.round(dc/all.length*100):0;
  var pf=document.getElementById('planProgFill'); if(pf) pf.style.width=pct+'%';
  var dce=document.getElementById('planDoneCount'); if(dce) dce.textContent=dc+'/'+all.length+' completed'+(pct===100?' \uD83C\uDF89 Shabash!':'');
}
function tickPlanChap(sub,idx){
  if(!planDone[sub])planDone[sub]={};
  planDone[sub][idx]=!planDone[sub][idx];
  savePlanLocal(); renderPlanDoneList();
}

function saveTimerState(){
  try{
    var uid=window._isGuest?'guest':(window._uid||null); if(!uid)return;
    localStorage.setItem('jee_timer_'+uid, JSON.stringify({
      studySec:studySec,
      studyOn:false,  // always save as paused — timer shouldn't auto-run on reload
      curSub:curSub,
      tSec:tSec,
      tOn:false       // arena timer bhi paused save karo
    }));
  }catch(e){}
}
function loadTimerState(){
  try{
    var uid=window._isGuest?'guest':(window._uid||null); if(!uid)return;
    var raw=localStorage.getItem('jee_timer_'+uid);
    if(!raw)return;
    var obj=JSON.parse(raw);
    // Restore study timer
    if(typeof obj.studySec==='number') studySec=obj.studySec;
    if(obj.curSub) curSub=obj.curSub;
    // Restore arena timer
    if(typeof obj.tSec==='number') tSec=obj.tSec;
    // Update displays
    var sd=document.getElementById('studyDisp'); if(sd) sd.textContent=fmtHMS(studySec);
    showT();
    // Restore subject button highlight
    var map={physics:'ph',chemistry:'ch',maths:'ma'};
    Object.keys(map).forEach(function(s){
      var el=document.getElementById('sb'+map[s]);
      if(el) el.classList.toggle('on',s===curSub);
    });
    var lbl=document.getElementById('studySubLabel');
    if(lbl && studySec>0) lbl.textContent=SYL[curSub].name+' padh raha hai...';
  }catch(e){}
}
var tSec=0,tOn=false,tIv=null;
function togTimer(){
  tOn=!tOn;
  var b=document.getElementById('tBtn');
  if(tOn){b.textContent='PAUSE';b.style.color='var(--red)';b.style.borderColor='var(--red)';tIv=setInterval(function(){tSec++;showT();},1000);}
  else{b.textContent='START';b.style.color='var(--green)';b.style.borderColor='var(--green)';clearInterval(tIv);saveTimerState();}
}
function rstTimer(){
  tOn=false;tSec=0;clearInterval(tIv);showT();saveTimerState();
  var b=document.getElementById('tBtn');b.textContent='START';b.style.color='var(--green)';b.style.borderColor='var(--green)';
}
function showT(){var el=document.getElementById('tDisp');if(el)el.textContent=p2(Math.floor(tSec/60))+':'+p2(tSec%60);}

// ═══════════════════════════════════════
// Q SELECTION HELPERS
// ═══════════════════════════════════════
function selArenaQs(val, btn){
  document.getElementById('cTotal').value = val;
  btn.parentNode.querySelectorAll('.qs-opt-btn').forEach(function(b){ b.classList.remove('on'); });
  btn.classList.add('on');
}
function selMockQs(val, btn){
  document.getElementById('mockQs').value = val;
  btn.parentNode.querySelectorAll('.qs-opt-btn').forEach(function(b){ b.classList.remove('on'); });
  btn.classList.add('on');
}

function loadChaps(){
  var sub=document.getElementById('cSub').value;
  var sel=document.getElementById('cChap');
  sel.innerHTML='<option value="all">All Chapters</option>';
  var subs=sub==='all'?['physics','chemistry','maths']:[sub];
  subs.forEach(function(sk){
    var og=document.createElement('optgroup');og.label=SYL[sk].name;
    SYL[sk].chapters.forEach(function(ch){var op=document.createElement('option');op.value=sk+'|'+ch;op.textContent=ch;og.appendChild(op);});
    sel.appendChild(og);
  });
}

// ═══════════════════════════════════════
// Q GENERATOR
// ═══════════════════════════════════════
var qs=[],uAns={},corrAns={};
function rnd(a){return a[Math.floor(Math.random()*a.length)];}
function genQ(){
  var sub=document.getElementById('cSub').value;
  var chapV=document.getElementById('cChap').value;
  var total=parseInt(document.getElementById('cTotal').value)||15; if(isNaN(total)||total<1)total=15;
  var nM=Math.round(total*0.6),nN=total-nM;
  qs=[];uAns={};corrAns={};
  var pool=[];
  if(chapV==='all'){var subs=sub==='all'?['physics','chemistry','maths']:[sub];subs.forEach(function(sk){SYL[sk].chapters.forEach(function(ch){pool.push({sk:sk,ch:ch});});});}
  else{var pts=chapV.split('|');pool.push({sk:pts[0],ch:pts[1]});}
  var id=1;
  for(var i=0;i<nM;i++){var c=rnd(pool);qs.push({id:id++,type:'MCQ',sk:c.sk,ch:c.ch});}
  for(var i=0;i<nN;i++){var c=rnd(pool);qs.push({id:id++,type:'NUM',sk:c.sk,ch:c.ch});}
  renderQ();
  document.getElementById('step2').style.display='none';
  document.getElementById('resCard').classList.remove('on');
  document.getElementById('statsBar').style.display='flex';
  updAStats();rstTimer();if(!tOn)togTimer();
}
function renderQ(){
  var tb=document.getElementById('qBody'); tb.innerHTML='';
  qs.forEach(function(q){
    var tr=document.createElement('tr');

    // Q# cell
    var td0=document.createElement('td');
    var qinp=document.createElement('input');
    qinp.type='number'; qinp.value=q.id; qinp.className='qn-inp';
    qinp.id='qn'+q.id; qinp.min=1;
    (function(qid){ qinp.addEventListener('input',function(){ autoFillQNum(qid,this.value); }); })(q.id);
    td0.appendChild(qinp);

    // Chapter cell
    var td1=document.createElement('td');
    td1.innerHTML='<div class="ch-lbl" style="color:'+SCOL[q.sk]+'">'+q.ch+'</div>'
      +'<div class="sub-lbl2">'+SYL[q.sk].name+'</div>'
      +'<span class="badge '+(q.type==='MCQ'?'bm':'bn')+'">'+q.type+'</span>';

    // Answer cell
    var td2=document.createElement('td');
    var optsDiv=document.createElement('div'); optsDiv.className='opts';
    ['A','B','C','D'].forEach(function(letter){
      var btn=document.createElement('button');
      btn.type='button'; btn.className='opt';
      btn.id='u'+q.id+letter; btn.textContent=letter;
      (function(qid,opt){
        btn.addEventListener('click',function(e){ e.stopPropagation(); uMCQ(qid,opt); });
      })(q.id,letter);
      optsDiv.appendChild(btn);
    });
    var orDiv=document.createElement('div'); orDiv.className='or-div';
    orDiv.innerHTML='<div class="ln"></div><span>YA</span><div class="ln"></div>';
    var numInp=document.createElement('input');
    numInp.type='number'; numInp.className='num-in'; numInp.id='un'+q.id;
    numInp.placeholder='Number...'; numInp.step='any';
    (function(qid){ numInp.addEventListener('input',function(){ uNum(qid,this.value); }); })(q.id);
    td2.appendChild(optsDiv); td2.appendChild(orDiv); td2.appendChild(numInp);

    tr.appendChild(td0); tr.appendChild(td1); tr.appendChild(td2);
    tb.appendChild(tr);
  });
}
function autoFillQNum(fromId,val){
  var n=parseInt(val);if(isNaN(n))return;
  for(var i=0;i<qs.length;i++){if(qs[i].id>fromId){var el=document.getElementById('qn'+qs[i].id);if(el){n++;el.value=n;}}}
}
function uMCQ(id,o){
  uAns[id]={t:'MCQ',v:o};
  ['A','B','C','D'].forEach(function(x){var el=document.getElementById('u'+id+x);if(el)el.classList.toggle('sel',x===o);});
  var ni=document.getElementById('un'+id);if(ni)ni.value='';
  updAStats();
}
function uNum(id,v){
  if(v!==''){uAns[id]={t:'NUM',v:v};['A','B','C','D'].forEach(function(x){var e=document.getElementById('u'+id+x);if(e)e.classList.remove('sel');});}
  else{delete uAns[id];}
  updAStats();
}
function updAStats(){
  var att=Object.keys(uAns).length,tot=qs.length;
  document.getElementById('sTot').textContent=tot;
  document.getElementById('sAtt').textContent=att;
  document.getElementById('sLft').textContent=tot-att;
  var mcq=0,num=0;qs.forEach(function(q){if(q.type==='MCQ')mcq++;else num++;});
  document.getElementById('sMcq').textContent=mcq;
  document.getElementById('sNum').textContent=num;
}
function submitAns(){
  if(!qs.length){alert('Pehle Generate karo!');return;}
  if(tOn)togTimer();
  corrAns={};
  qs.forEach(function(q){var el=document.getElementById('qn'+q.id);q.dispId=el?el.value:q.id;});
  var tb=document.getElementById('corrBody'); tb.innerHTML='';
  qs.forEach(function(q){
    var ua=uAns[q.id];
    var uaHTML=!ua?'<span style="color:var(--text3);font-style:italic;">skipped</span>'
      :ua.t==='MCQ'?'<b style="color:var(--blue)">Opt '+ua.v+'</b>'
      :'<b style="color:var(--orange)">'+ua.v+'</b>';

    var tr=document.createElement('tr');

    var td0=document.createElement('td');
    td0.innerHTML='<b style="color:var(--blue);font-size:14px;">'+(q.dispId||q.id)+'</b>';

    var td1=document.createElement('td');
    td1.innerHTML='<div class="ch-lbl" style="color:'+SCOL[q.sk]+'">'+q.ch+'</div>';

    var td2=document.createElement('td');
    td2.innerHTML=uaHTML;

    var td3=document.createElement('td');
    var optsDiv=document.createElement('div'); optsDiv.className='opts'; optsDiv.style.marginBottom='4px';
    ['A','B','C','D'].forEach(function(letter){
      var btn=document.createElement('button');
      btn.type='button'; btn.className='opt';
      btn.id='c'+q.id+letter; btn.textContent=letter;
      (function(qid,opt){
        btn.addEventListener('click',function(e){ e.stopPropagation(); cMCQ(qid,opt); });
      })(q.id,letter);
      optsDiv.appendChild(btn);
    });
    var orDiv=document.createElement('div'); orDiv.className='or-div';
    orDiv.innerHTML='<div class="ln"></div><span>YA</span><div class="ln"></div>';
    var numInp=document.createElement('input');
    numInp.type='number'; numInp.className='num-in'; numInp.id='cn'+q.id;
    numInp.placeholder='Correct...'; numInp.step='any';
    (function(qid){ numInp.addEventListener('input',function(){ cNum(qid,this.value); }); })(q.id);
    td3.appendChild(optsDiv); td3.appendChild(orDiv); td3.appendChild(numInp);

    tr.appendChild(td0); tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
    tb.appendChild(tr);
  });
  document.getElementById('step2').style.display='block';
  document.getElementById('resCard').classList.remove('on');
  document.getElementById('step2').scrollIntoView({behavior:'smooth',block:'start'});
}
function cMCQ(id,o){
  corrAns[id]={t:'MCQ',v:o};
  ['A','B','C','D'].forEach(function(x){var el=document.getElementById('c'+id+x);if(el)el.classList.toggle('csel',x===o);});
  var ni=document.getElementById('cn'+id);if(ni)ni.value='';
}
function cNum(id,v){
  if(v!==''){corrAns[id]={t:'NUM',v:v};['A','B','C','D'].forEach(function(x){var e=document.getElementById('c'+id+x);if(e)e.classList.remove('csel');});}
  else{delete corrAns[id];}
}

// ═══════════════════════════════════════
// SHOW RESULT  ← yahan chapter stats track hoti hai
// ═══════════════════════════════════════
function showResult(){
  var corr=0,wrong=0,skip=0,score=0,html=[];
  var chapData = {}; // chapter-wise tracking for this session

  qs.forEach(function(q){
    var ua=uAns[q.id],ca=corrAns[q.id];
    var status='sk',uaL='Skipped',caL=ca?(ca.t==='MCQ'?'Opt '+ca.v:ca.v):'—';

    // ── Track chapter attempts ──
    var ck = q.sk+'|'+q.ch;
    if(!chapData[ck]) chapData[ck]={sub:q.sk, ch:q.ch, attempted:0, corr:0, wrong:0, skip:0};
    chapData[ck].attempted++;

    if(!ua||!ca){skip++;if(ua)uaL=ua.t==='MCQ'?'Opt '+ua.v:ua.v;}
    else{
      uaL=ua.t==='MCQ'?'Opt '+ua.v:ua.v;
      if(ca.t==='MCQ'){if(ua.t==='MCQ'&&ua.v===ca.v){corr++;score+=4;status='ok';}else{wrong++;score-=1;status='no';}}
      else{var uv=parseFloat(ua.v),cv=parseFloat(ca.v);if(!isNaN(uv)&&!isNaN(cv)&&Math.abs(uv-cv)<=0.01){corr++;score+=4;status='ok';}else{wrong++;status='no';}}
    }
    // ── Track per-chapter result ──
    if(status==='ok') chapData[ck].corr++;
    else if(status==='no') chapData[ck].wrong++;
    else chapData[ck].skip++;

    html.push('<div class="ans-row '+status+'"><span style="font-size:11px;font-weight:700;color:var(--blue);min-width:24px">Q'+(q.dispId||q.id)+'</span><span style="flex:1;font-size:12px;color:var(--text2)">'+q.ch+'</span><span style="font-size:13px;font-weight:700;min-width:50px">'+uaL+'</span><span style="color:var(--green);font-size:12px;min-width:50px">&check; '+caL+'</span><span>'+(status==='ok'?'\u2705':status==='no'?'\u274C':'\u23ED\uFE0F')+'</span></div>');
  });

  document.getElementById('rScore').textContent=score;
  document.getElementById('rCorr').textContent=corr;
  document.getElementById('rWrong').textContent=wrong;
  document.getElementById('rSkip').textContent=skip;
  document.getElementById('rAcc').textContent=(qs.length?Math.round(corr/qs.length*100):0)+'%';
  document.getElementById('ansList').innerHTML=html.join('');
  var rc=document.getElementById('resCard');rc.classList.add('on');rc.scrollIntoView({behavior:'smooth',block:'start'});
  showRankPredictor(score, qs.length);
  prepMistakeLog(qs, uAns, corrAns);

  var d=new Date();
  var dateKey = d.toISOString().split('T')[0];
  saveMockData({id:Date.now(),date:dateKey,score:score,qs:qs.length,corr:corr,wrong:wrong,auto:true});

  // ── Update daily subject-wise stats ──
  updateDailyArenaStats(dateKey, chapData);

  // ── Save chapter stats ──
  updateArenaChapterStats(chapData);
}

// ═══════════════════════════════════════
// RANK PREDICTOR
// ═══════════════════════════════════════
function showRankPredictor(score, total){
  var rp = document.getElementById('rankPredictor');
  if(!rp) return;
  var maxScore = total * 4;
  if(maxScore <= 0){ rp.style.display='none'; return; }
  var scaledScore = Math.round((score / maxScore) * 300);
  scaledScore = Math.max(0, scaledScore);
  var percentile;
  if(scaledScore >= 285)      percentile = 99.99;
  else if(scaledScore >= 270) percentile = 99.95;
  else if(scaledScore >= 250) percentile = 99.9;
  else if(scaledScore >= 230) percentile = 99.7;
  else if(scaledScore >= 210) percentile = 99.4;
  else if(scaledScore >= 190) percentile = 98.8;
  else if(scaledScore >= 170) percentile = 97.5;
  else if(scaledScore >= 150) percentile = 95.0;
  else if(scaledScore >= 130) percentile = 91.0;
  else if(scaledScore >= 110) percentile = 84.0;
  else if(scaledScore >= 90)  percentile = 74.0;
  else if(scaledScore >= 70)  percentile = 60.0;
  else if(scaledScore >= 50)  percentile = 45.0;
  else if(scaledScore >= 30)  percentile = 28.0;
  else                        percentile = Math.max(1, scaledScore * 0.4);
  var rank = Math.round((100 - percentile) / 100 * 1200000);
  var rankStr;
  if(rank < 100)        rankStr = '< 100';
  else if(rank < 500)   rankStr = '< 500';
  else if(rank < 1000)  rankStr = '< 1,000';
  else if(rank < 5000)  rankStr = '< 5,000';
  else if(rank < 10000) rankStr = '< 10,000';
  else if(rank < 25000) rankStr = '< 25,000';
  else if(rank < 50000) rankStr = '< 50,000';
  else if(rank < 100000)rankStr = '< 1,00,000';
  else if(rank < 200000)rankStr = '< 2,00,000';
  else                  rankStr = '> 2,00,000';
  var category, msg;
  if(percentile >= 99.9){      category='IIT Top 5';  msg='🔥 IIT Bombay/Delhi pakka! Tu beast hai bhai!';}
  else if(percentile >= 99.5){ category='IIT Zone';   msg='🎯 IIT milega! Bas consistency rakh aur mock dete reh!';}
  else if(percentile >= 99){   category='IIT Zone';   msg='⚡ IIT possible hai! Accuracy thodi aur badhao!';}
  else if(percentile >= 98){   category='IIT/NIT+';   msg='📈 IIT ke bahut karib! Weak chapters pe focus karo!';}
  else if(percentile >= 95){   category='NIT Top';    msg='💪 NIT Top branch pakki! IIT ke liye aur 2-3 mock do!';}
  else if(percentile >= 90){   category='NIT Zone';   msg='📚 NIT milega! Roz 1 mock lagao improvement hogi!';}
  else if(percentile >= 80){   category='NIT/IIIT';   msg='🚀 Mehnat badhao — NIT door nahi!';}
  else{                        category='Keep Going'; msg='💡 Abhi bahut time hai! Concepts clear karo!';}
  document.getElementById('predPercentile').textContent = percentile.toFixed(2)+'%';
  document.getElementById('predRank').textContent = rankStr;
  document.getElementById('predCategory').textContent = category;
  document.getElementById('predMsg').textContent = msg;
  var info = document.getElementById('predScaledScore');
  if(info) info.textContent = 'Scaled score (out of 300): '+scaledScore;
  rp.style.display = 'block';
  rp.style.marginTop = '16px';
}

// ═══════════════════════════════════════
// MOCK TRACKER
// ═══════════════════════════════════════
function saveMockData(mock){
  mocks.unshift(mock);
  saveLocal();
  renderStats();
  window.FS.saveMockFS(mock);
}
function saveMock(){
  var date=document.getElementById('mockDate').value;
  var mockQs=parseInt(document.getElementById('mockQs').value); if(!mockQs||isNaN(mockQs))mockQs=0;
  var corr=parseInt(document.getElementById('mockCorr').value)||0;
  var wrong=parseInt(document.getElementById('mockWrong').value)||0;
  if(!date){alert('Date bharo!');return;}
  saveMockData({id:Date.now(),date:date,score:corr*4-wrong,qs:mockQs,corr:corr,wrong:wrong});
  document.getElementById('mockCorr').value='';
  document.getElementById('mockWrong').value='';
}
function setPeriod(p,btn){
  curPeriod=p;
  document.querySelectorAll('.per-btn').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
  renderStats();
}
function filterMocks(p){
  var now=new Date();
  return mocks.filter(function(m){
    var md=new Date(m.date);
    if(p==='day') return md.toDateString()===now.toDateString();
    if(p==='week'){var w=new Date(now);w.setDate(w.getDate()-7);return md>=w;}
    if(p==='month') return md.getMonth()===now.getMonth()&&md.getFullYear()===now.getFullYear();
    return true;
  });
}
function calcStreak(){
  if(!mocks.length)return 0;
  var seen={};mocks.forEach(function(m){if(m.date)seen[m.date]=true;});
  var dates=Object.keys(seen).sort().reverse(),streak=0,now=new Date();now.setHours(0,0,0,0);
  for(var i=0;i<dates.length;i++){var d=new Date(dates[i]);d.setHours(0,0,0,0);if(Math.round((now-d)/86400000)===i)streak++;else break;}
  return streak;
}
function updateStreakBadge(){
  var s=calcStreak();
  var el=document.getElementById('streakBadge');
  if(el) el.textContent=(s>=3?'\uD83D\uDD25':'\u2B50')+' '+s;
}
window.showStatus = function(s){
  var el=document.getElementById('sheetsStatus');if(!el)return;
  var msgs={loading:'\u23F3 Loading from cloud...',synced:'\u2601\uFE0F Cloud sync OK \u2014 data safe hai!',saved:'\u2705 Mock saved to cloud!',save_err:'\u26A0\uFE0F Save failed \u2014 local backup active',guest:'\uD83D\uDC40 Guest Mode \u2014 data sirf is device pe save hoga. Login karo cloud backup ke liye!'};
  var cols={loading:'var(--orange)',synced:'var(--green)',saved:'var(--green)',save_err:'var(--red)',guest:'var(--purple)'};
  el.textContent=msgs[s]||s;el.style.color=cols[s]||'var(--text2)';
};
var _mockShowCount = 5;

function renderStats(){
  _mockShowCount = 5;
  var filtered = filterMocks(curPeriod);
  var tQs=0, tCorr=0, tWrong=0;
  filtered.forEach(function(m){ tQs+=m.qs; tCorr+=m.corr; tWrong+=(m.wrong||0); });
  var sg = document.getElementById('sumGrid'); if(!sg) return;
  var tAcc = tQs>0 ? Math.round(tCorr/tQs*100) : 0;
  var accCol = tAcc>=75?'var(--green)':tAcc>=50?'var(--orange)':'var(--red)';
  sg.innerHTML =
    '<div class="sum-box"><div class="sum-val" style="color:var(--blue)">'+filtered.length+'</div><div class="sum-lbl">MOCKS</div></div>'
   +'<div class="sum-box"><div class="sum-val">'+tQs+'</div><div class="sum-lbl">ATTEMPTED</div></div>'
   +'<div class="sum-box"><div class="sum-val" style="color:var(--green)">'+tCorr+'</div><div class="sum-lbl">CORRECT \u2713</div></div>'
   +'<div class="sum-box"><div class="sum-val" style="color:var(--red)">'+tWrong+'</div><div class="sum-lbl">WRONG \u2717</div></div>'
   +'<div class="sum-box" style="grid-column:1/-1;background:var(--bg);"><div class="sum-val" style="color:'+accCol+'">'+tAcc+'%</div><div class="sum-lbl">\u2022 OVERALL ACCURACY \u2022</div></div>';
  renderMockList(filtered);
  var streak = calcStreak();
  var mb = document.getElementById('motivBar');
  mb.innerHTML=(streak>=3?'\uD83D\uDD25':'\u2B50')+' '+(streak>=7?streak+' din ka streak! Machine ban gaya!':streak>=3?streak+' din consistent!':mocks.length>0?mocks.length+' mocks done! Keep going!':'Pehla mock lagao aaj!')+' \u2022 '+mocks.length+' total mocks';
  mb.classList.add('on');
  updateStreakBadge();
  renderSubjectStats();
}

function renderMockList(filtered) {
  if(!filtered) filtered = filterMocks(curPeriod);
  var ml = document.getElementById('mockList'); if(!ml) return;
  if(!filtered.length){
    ml.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:13px;padding:20px;">Is period mein koi mock nahi</div>';
    return;
  }
  var show = Math.min(_mockShowCount, filtered.length);
  var html = '';
  for(var i=0; i<show; i++){
    var m = filtered[i];
    var acc = m.qs>0 ? Math.round((m.corr||0)/m.qs*100) : 0;
    var accCol = acc>=75?'var(--green)':acc>=50?'var(--orange)':'var(--red)';
    html += '<div class="mock-item2">'
      + '<div class="mock-dt">'+m.date
      + (m.auto?' <span style="font-size:9px;background:var(--bluelt);color:var(--blue);padding:2px 5px;border-radius:4px;">AUTO</span>':'')
      + '</div>'
      + '<div style="flex:1;display:flex;gap:10px;justify-content:flex-end;align-items:center;">'
      + '<div class="mock-stat"><div class="mock-stat-lbl">Attempted</div><div class="mock-stat-val" style="color:var(--blue)">'+m.qs+'</div></div>'
      + '<div class="mock-stat"><div class="mock-stat-lbl">Correct</div><div class="mock-stat-val" style="color:var(--green)">'+m.corr+'</div></div>'
      + '<div class="mock-stat"><div class="mock-stat-lbl">Wrong</div><div class="mock-stat-val" style="color:var(--red)">'+(m.wrong||0)+'</div></div>'
      + '<div class="mock-stat"><div class="mock-stat-lbl">Acc</div><div class="mock-stat-val" style="color:'+accCol+'">'+acc+'%</div></div>'
      + '</div></div>';
  }
  var remaining = filtered.length - show;
  if(remaining > 0){
    html += '<div onclick="mockSeeMore()" style="width:100%;padding:11px;margin-top:6px;border-radius:10px;border:1.5px dashed var(--blue);background:var(--bluelt);color:var(--blue);font-size:13px;font-weight:700;cursor:pointer;text-align:center;">'
          + '\u25bc  '+remaining+' aur dekho</div>';
  } else if(filtered.length > 5){
    html += '<div onclick="mockSeeLess()" style="width:100%;padding:11px;margin-top:6px;border-radius:10px;border:1.5px dashed var(--border);background:var(--bg);color:var(--text3);font-size:13px;font-weight:700;cursor:pointer;text-align:center;">'
          + '\u25b2  Kam karo</div>';
  }
  ml.innerHTML = html;
}

function mockSeeMore(){
  _mockShowCount += 10;
  renderMockList();
}
function mockSeeLess(){
  _mockShowCount = 5;
  renderMockList();
}




// ═══════════════════════════════════════
// 📅 DAILY ARENA STATS
// ═══════════════════════════════════════
function updateDailyArenaStats(dateKey, chapData){
  if(!dailyArenaStats[dateKey]){
    dailyArenaStats[dateKey]={
      physics:{att:0,corr:0,wrong:0,skip:0},
      chemistry:{att:0,corr:0,wrong:0,skip:0},
      maths:{att:0,corr:0,wrong:0,skip:0},
      total:{att:0,corr:0,wrong:0,skip:0}
    };
  }
  var day=dailyArenaStats[dateKey];
  Object.keys(chapData).forEach(function(ck){
    var c=chapData[ck], sub=c.sub;
    if(!day[sub]) return;
    day[sub].att  += c.attempted||0;
    day[sub].corr += c.corr||0;
    day[sub].wrong+= c.wrong||0;
    day[sub].skip += c.skip||0;
    day.total.att  += c.attempted||0;
    day.total.corr += c.corr||0;
    day.total.wrong+= c.wrong||0;
    day.total.skip += c.skip||0;
  });
  saveLocal();
  if(window.FS && window._uid) window.FS.saveDailyArena(dailyArenaStats);
  renderDailyArenaStats();
}

function renderDailyArenaStats(){
  var el=document.getElementById('dailyArenaGrid'); if(!el) return;
  var allDates=Object.keys(dailyArenaStats).sort().reverse().slice(0,30);
  if(!allDates.length){
    el.innerHTML='<div style="text-align:center;color:var(--text3);font-size:13px;padding:16px 0;line-height:1.8;">Arena mein questions solve karo\u2014daily breakdown yahan dikhega!</div>';
    return;
  }
  var dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var subs=[
    {key:'physics',  label:'Physics',   col:'var(--blue)',   bg:'#eef2ff', emoji:'\u26a1'},
    {key:'chemistry',label:'Chemistry', col:'var(--orange)', bg:'#fff7ed', emoji:'\u{1f9ea}'},
    {key:'maths',    label:'Maths',     col:'var(--green)',  bg:'#dcfce7', emoji:'\u{1f4d0}'}
  ];
  var html='';
  allDates.forEach(function(dk){
    var day=dailyArenaStats[dk];
    var t=day.total||{att:0,corr:0,wrong:0,skip:0};
    if(!t.att) return;
    var acc=t.att>0?Math.round(t.corr/t.att*100):0;
    var accCol=acc>=75?'var(--green)':acc>=50?'var(--orange)':'var(--red)';
    var dateObj=new Date(dk+'T00:00:00');
    var isToday=dk===today();
    var dayLabel=isToday?'Today \uD83D\uDD25':dayNames[dateObj.getDay()]+', '+dateObj.getDate()+' '+months[dateObj.getMonth()];

    html+='<div style="border:1.5px solid var(--border);border-radius:12px;margin-bottom:10px;overflow:hidden;">';
    html+='<div style="display:flex;align-items:center;gap:8px;padding:10px 13px;background:'
      +(isToday?'var(--bluelt)':'var(--bg)')+';border-bottom:1px solid var(--border);">'
      +'<div style="flex:1;font-size:13px;font-weight:800;color:'+(isToday?'var(--blue)':'var(--text)')+';">'+dayLabel+'</div>'
      +'<div style="display:flex;gap:8px;align-items:baseline;">'
      +'<div style="text-align:center;min-width:36px;">'
        +'<div style="font-size:20px;font-weight:900;color:var(--blue);line-height:1;">'+t.att+'</div>'
        +'<div style="font-size:9px;font-weight:700;color:var(--text3);">TOTAL</div>'
      +'</div>'
      +'<div style="text-align:center;min-width:30px;">'
        +'<div style="font-size:17px;font-weight:900;color:var(--green);line-height:1;">'+t.corr+'</div>'
        +'<div style="font-size:9px;font-weight:700;color:var(--text3);">\u2713</div>'
      +'</div>'
      +'<div style="text-align:center;min-width:30px;">'
        +'<div style="font-size:17px;font-weight:900;color:var(--red);line-height:1;">'+t.wrong+'</div>'
        +'<div style="font-size:9px;font-weight:700;color:var(--text3);">\u2717</div>'
      +'</div>'
      +'<div style="text-align:center;min-width:38px;">'
        +'<div style="font-size:17px;font-weight:900;color:'+accCol+';line-height:1;">'+acc+'%</div>'
        +'<div style="font-size:9px;font-weight:700;color:var(--text3);">ACC</div>'
      +'</div>'
      +'</div></div>';

    html+='<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--border);">';
    subs.forEach(function(s){
      var sd=day[s.key]||{att:0,corr:0,wrong:0};
      var sacc=sd.att>0?Math.round((sd.corr||0)/sd.att*100):0;
      var saccCol=sacc>=75?s.col:sacc>=50?'var(--orange)':'var(--red)';
      html+='<div style="background:'+s.bg+';padding:8px 6px;text-align:center;">'
        +'<div style="font-size:11px;font-weight:800;color:'+s.col+';margin-bottom:3px;">'+s.emoji+' '+s.label+'</div>'
        +(sd.att>0
          ?'<div style="font-size:19px;font-weight:900;color:'+s.col+';line-height:1;">'+sd.att+'</div>'
           +'<div style="display:flex;justify-content:center;gap:5px;margin-top:3px;">'
           +'<span style="font-size:9px;font-weight:700;color:var(--green);">\u2713'+(sd.corr||0)+'</span>'
           +'<span style="font-size:9px;font-weight:700;color:var(--red);">\u00d7'+(sd.wrong||0)+'</span>'
           +'<span style="font-size:9px;font-weight:700;color:'+saccCol+';">'+sacc+'%</span>'
           +'</div>'
          :'<div style="font-size:15px;font-weight:700;color:var(--text3);">\u2014</div>')
        +'</div>';
    });
    html+='</div></div>';
  });
  el.innerHTML=html;
}


function renderSubjectStats(){
  var el=document.getElementById('subjectStatsGrid'); if(!el)return;

  // Aggregate from arenaChapterStats (all-time, not period-filtered)
  var sub={physics:{att:0,corr:0,wrong:0,skip:0},chemistry:{att:0,corr:0,wrong:0,skip:0},maths:{att:0,corr:0,wrong:0,skip:0}};
  Object.keys(arenaChapterStats).forEach(function(ck){
    var s=arenaChapterStats[ck];
    if(!sub[s.sub])return;
    sub[s.sub].att  += s.attempted||0;
    sub[s.sub].corr += s.corr||0;
    sub[s.sub].wrong+= s.wrong||0;
    sub[s.sub].skip += s.skip||0;
  });

  var total=sub.physics.att+sub.chemistry.att+sub.maths.att;

  // If no arena data yet, show empty state
  if(!total){
    el.innerHTML='<div style="text-align:center;color:var(--text3);font-size:13px;padding:16px 0;line-height:1.8;">⚔️ Arena mein questions solve karo<br>yahan subject-wise breakdown dikhega!</div>';
    return;
  }

  var subs=[
    {key:'physics', label:'Physics', emoji:'⚡', bg:'var(--bluelt)', border:'#c7d2fe', col:'var(--blue)'},
    {key:'chemistry', label:'Chemistry', emoji:'🧪', bg:'var(--orangelt)', border:'#fed7aa', col:'var(--orange)'},
    {key:'maths', label:'Maths', emoji:'📐', bg:'var(--greenlt)', border:'#bbf7d0', col:'var(--green)'}
  ];

  // Overall bar
  var overallHtml='<div style="background:var(--bg);border-radius:10px;padding:12px 14px;margin-bottom:12px;border:1px solid var(--border);">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
    +'<span style="font-size:12px;font-weight:700;color:var(--text2);">TOTAL QUESTIONS</span>'
    +'<span style="font-size:22px;font-weight:900;color:var(--blue);">'+total+'</span>'
    +'</div>'
    +'<div style="display:flex;height:10px;border-radius:99px;overflow:hidden;gap:2px;">';

  subs.forEach(function(s){
    var pct=total>0?Math.round(sub[s.key].att/total*100):0;
    if(pct>0) overallHtml+='<div style="width:'+pct+'%;background:'+s.col+';border-radius:99px;" title="'+s.label+': '+pct+'%"></div>';
  });
  overallHtml+='</div>'
    +'<div style="display:flex;gap:12px;margin-top:6px;">';
  subs.forEach(function(s){
    var pct=total>0?Math.round(sub[s.key].att/total*100):0;
    overallHtml+='<span style="font-size:10px;font-weight:700;color:'+s.col+';">'+s.emoji+' '+pct+'%</span>';
  });
  overallHtml+='</div></div>';

  // Per-subject cards
  var cardsHtml='<div style="display:flex;flex-direction:column;gap:8px;">';
  subs.forEach(function(s){
    var d=sub[s.key];
    var acc=d.att>0?Math.round(d.corr/d.att*100):0;
    var accCol=acc>=75?'var(--green)':acc>=50?'var(--orange)':'var(--red)';
    var barW=total>0?Math.round(d.att/total*100):0;
    cardsHtml+='<div style="background:'+s.bg+';border:1.5px solid '+s.border+';border-radius:12px;padding:12px 14px;">'
      // Header row
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">'
      +'<span style="font-size:20px;">'+s.emoji+'</span>'
      +'<div style="flex:1;">'
      +'<div style="font-size:13px;font-weight:800;color:'+s.col+';">'+s.label+'</div>'
      +'<div style="height:5px;background:rgba(0,0,0,.08);border-radius:99px;margin-top:4px;overflow:hidden;">'
      +'<div style="width:'+barW+'%;height:100%;background:'+s.col+';border-radius:99px;transition:width .5s;"></div>'
      +'</div>'
      +'</div>'
      +'<div style="text-align:right;">'
      +'<div style="font-size:22px;font-weight:900;color:'+s.col+';">'+d.att+'</div>'
      +'<div style="font-size:9px;font-weight:700;color:var(--text3);">ATTEMPTED</div>'
      +'</div>'
      +'</div>'
      // Stats row
      +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;">'
      +'<div style="background:rgba(255,255,255,.7);border-radius:8px;padding:7px;text-align:center;">'
      +'<div style="font-size:16px;font-weight:900;color:var(--green);">'+d.corr+'</div>'
      +'<div style="font-size:9px;font-weight:700;color:var(--text3);">CORRECT</div>'
      +'</div>'
      +'<div style="background:rgba(255,255,255,.7);border-radius:8px;padding:7px;text-align:center;">'
      +'<div style="font-size:16px;font-weight:900;color:var(--red);">'+d.wrong+'</div>'
      +'<div style="font-size:9px;font-weight:700;color:var(--text3);">WRONG</div>'
      +'</div>'
      +'<div style="background:rgba(255,255,255,.7);border-radius:8px;padding:7px;text-align:center;">'
      +'<div style="font-size:16px;font-weight:900;color:var(--text2);">'+d.skip+'</div>'
      +'<div style="font-size:9px;font-weight:700;color:var(--text3);">SKIPPED</div>'
      +'</div>'
      +'<div style="background:rgba(255,255,255,.7);border-radius:8px;padding:7px;text-align:center;">'
      +'<div style="font-size:16px;font-weight:900;color:'+accCol+';">'+acc+'%</div>'
      +'<div style="font-size:9px;font-weight:700;color:var(--text3);">ACCURACY</div>'
      +'</div>'
      +'</div>'
      +'</div>';
  });
  cardsHtml+='</div>';

  el.innerHTML=overallHtml+cardsHtml;
}

// ═══════════════════════════════════════
// ⚔️ ARENA CHAPTER STATS  ← NEW FEATURE
// ═══════════════════════════════════════
var ACS_SCOLOR = {physics:'#eef2ff', chemistry:'#fff7ed', maths:'#dcfce7'};
var ACS_TCOLOR = {physics:'#4f46e5', chemistry:'#ea580c', maths:'#16a34a'};
var ACS_EMOJI  = {physics:'⚡', chemistry:'🧪', maths:'📐'};

// Called after every Arena result — merges this session's data into global stats
function updateArenaChapterStats(chapData){
  Object.keys(chapData).forEach(function(ck){
    if(!arenaChapterStats[ck]){
      arenaChapterStats[ck] = {sub: chapData[ck].sub, ch: chapData[ck].ch, attempted:0, corr:0, wrong:0, skip:0};
    }
    arenaChapterStats[ck].attempted += chapData[ck].attempted;
    arenaChapterStats[ck].corr     += (chapData[ck].corr  || 0);
    arenaChapterStats[ck].wrong    += (chapData[ck].wrong || 0);
    arenaChapterStats[ck].skip     += (chapData[ck].skip  || 0);
  });
  saveLocal();
  if(window.FS && window._uid) window.FS.saveArenaChapterStats(arenaChapterStats);
  renderArenaChapterStats();
  renderHeatmap();
  renderSubjectStats();
}

// Render the stats card in the Stats section
function renderArenaChapterStats(){
  var el = document.getElementById('arenaChapList');
  if(!el) return;

  // Get keys and apply subject filter
  var keys = Object.keys(arenaChapterStats);
  if(acsFilter !== 'all'){
    keys = keys.filter(function(k){ return arenaChapterStats[k].sub === acsFilter; });
  }

  // Sort: most attempted first
  keys.sort(function(a,b){
    return arenaChapterStats[b].attempted - arenaChapterStats[a].attempted;
  });

  if(!keys.length){
    el.innerHTML = '<div class="acs-empty">'
      + '⚔️ Abhi koi data nahi<br>'
      + '<span style="font-size:11px;">Arena mein test do — chapter stats yahan dikhenge!</span>'
      + '</div>';
    return;
  }

  var html = '';
  keys.forEach(function(ck, idx){
    var s = arenaChapterStats[ck];
    var rank = idx + 1;
    var rankColor = rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : rank === 3 ? '#cd7c2f' : 'var(--text3)';
    var acc = s.attempted > 0 ? Math.round((s.corr||0)/s.attempted*100) : 0;
    html += '<div class="acs-row" style="flex-wrap:wrap;gap:4px;">'
      + '<div style="display:flex;align-items:center;gap:8px;width:100%;">'
      +   '<div class="acs-rank" style="color:'+rankColor+'">'+(rank<=3?['🥇','🥈','🥉'][rank-1]:rank)+'</div>'
      +   '<div class="acs-ch">'+s.ch+'</div>'
      +   '<span class="acs-sub-tag" style="background:'+ACS_SCOLOR[s.sub]+';color:'+ACS_TCOLOR[s.sub]+'">'+ ACS_EMOJI[s.sub] +'</span>'
      + '</div>'
      + '<div style="display:flex;gap:5px;width:100%;margin-top:4px;">'
      +   '<div class="acs-count" style="flex:1;"><div class="acs-count-val" style="color:var(--blue)">'+s.attempted+'</div><div class="acs-count-lbl">TOTAL</div></div>'
      +   '<div class="acs-count" style="flex:1;"><div class="acs-count-val" style="color:var(--green)">'+(s.corr||0)+'</div><div class="acs-count-lbl">CORRECT</div></div>'
      +   '<div class="acs-count" style="flex:1;"><div class="acs-count-val" style="color:var(--red)">'+(s.wrong||0)+'</div><div class="acs-count-lbl">WRONG</div></div>'
      +   '<div class="acs-count" style="flex:1;"><div class="acs-count-val" style="color:var(--text2)">'+(s.skip||0)+'</div><div class="acs-count-lbl">SKIP</div></div>'
      +   '<div class="acs-count" style="flex:1;"><div class="acs-count-val" style="color:var(--purple)">'+acc+'%</div><div class="acs-count-lbl">ACC</div></div>'
      + '</div>'
      + '</div>';
  });
  el.innerHTML = html;
}

// Filter by subject
function setACSFilter(f, btn){
  acsFilter = f;
  document.querySelectorAll('.acs-fbtn').forEach(function(b){ b.classList.remove('on'); });
  if(btn) btn.classList.add('on');
  renderArenaChapterStats();
}

// Reset all arena chapter stats
function clearArenaChapterStats(){
  dconfirmShow({
    icon:'🗑️',
    title:'Arena Stats Reset?',
    msg:'Saare chapter-wise stats permanently delete ho jaayenge.',
    title2:'Pakka reset karna hai?',
    msg2:'Yeh bilkul undo nahi hoga — saara data chala jaayega!',
    okText:'Haan, Delete Karo',
    okText2:'CONFIRM — Haan Pakka Delete Karo',
    onConfirm: function(){
      arenaChapterStats = {};
      saveLocal();
      if(window.FS && window._uid) window.FS.clearArenaChapterStatsFS();
      renderArenaChapterStats();
      renderHeatmap();
      renderSubjectStats();
    }
  });
}

// ═══════════════════════════════════════
// AI CHAT
// ═══════════════════════════════════════
var WURL='https://jeegemini.manojd9414.workers.dev';
var SYS={role:'system',content:'Tu ek expert JEE teacher hai. Physics, Chemistry aur Maths ke questions step-by-step explain kar. Hinglish mein baat kar. Bahut clear aur concise reh.'};
var aiCur='gemini',aiHist={gemini:[SYS],grok:[SYS],chatgpt:[SYS]},aiLoad=false;
var AI_LABELS={gemini:'GEMINI 2.0 FLASH',grok:'GROK 3',chatgpt:'GPT-4o'};

function switchAI(name){
  aiCur=name;
  document.querySelectorAll('.ai-tab').forEach(function(b){b.classList.remove('on');});
  var t=document.getElementById('at'+name);if(t)t.classList.add('on');
  var lbl=document.getElementById('aiLabel');if(lbl)lbl.textContent=AI_LABELS[name];
  renderChat();
}
function renderChat(){
  var win=document.getElementById('chatWin');win.innerHTML='';
  var hist=aiHist[aiCur];
  if(hist.length<=1){addBub('b','\uD83D\uDC4B JEE ka koi bhi sawaal pucho \u2014 Physics, Chemistry ya Maths!');return;}
  hist.forEach(function(m){if(m.role!=='system')addBub(m.role==='user'?'u':'b',m.content);});
}
function addBub(side,text){
  var win=document.getElementById('chatWin');
  var wrap=document.createElement('div');wrap.className='cmsg '+side;
  var bub=document.createElement('div');bub.className='cbub '+side;bub.textContent=text;
  wrap.appendChild(bub);win.appendChild(wrap);win.scrollTop=win.scrollHeight;
}
function chatSend(){
  if(aiLoad)return;
  var ta=document.getElementById('chatTxt');
  var txt=ta.value.trim();if(!txt)return;
  ta.value='';ta.style.height='42px';
  addBub('u',txt);
  aiHist[aiCur].push({role:'user',content:txt});
  aiLoad=true;
  var btn=document.getElementById('chatSendBtn');btn.disabled=true;btn.textContent='...';
  var win=document.getElementById('chatWin');
  var tw=document.createElement('div');tw.className='cmsg b';tw.id='typBub';
  var tb2=document.createElement('div');tb2.className='cbub b ty';tb2.textContent='typing...';
  tw.appendChild(tb2);win.appendChild(tw);win.scrollTop=win.scrollHeight;
  var contents=[
    {role:'user',parts:[{text:'You are an expert JEE teacher. Explain step by step in Hinglish.'}]},
    {role:'model',parts:[{text:'Bilkul! Pucho koi bhi JEE sawaal!'}]}
  ];
  aiHist[aiCur].forEach(function(m){
    if(m.role!=='system')contents.push({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]});
  });
  fetch(WURL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'gemini-2.0-flash',contents:contents,generationConfig:{temperature:0.7,maxOutputTokens:2048}})})
  .then(function(r){return r.json();})
  .then(function(data){
    var reply=data.candidates&&data.candidates[0]&&data.candidates[0].content?data.candidates[0].content.parts[0].text:('\u274C Error: '+(data.error?data.error.message:'Unknown'));
    aiHist[aiCur].push({role:'assistant',content:reply});
    var tb3=document.getElementById('typBub');if(tb3)tb3.remove();
    addBub('b',reply);
  })
  .catch(function(err){var tb3=document.getElementById('typBub');if(tb3)tb3.remove();addBub('b','\u274C Error: '+err.message);})
  .finally(function(){aiLoad=false;btn.disabled=false;btn.textContent='Send \u25B6';});
}
function clearChat(){
  dconfirmShow({
    icon:'🤖',
    title:'Chat Clear?',
    msg:'"'+['Gemini','Grok','ChatGPT'][['gemini','grok','chatgpt'].indexOf(aiCur)]+'" ki poori conversation delete ho jaayegi.',
    title2:'Pakka clear karna hai?',
    msg2:'Chat history wapas nahi aayegi — bilkul undo nahi hoga!',
    okText:'Haan, Clear Karo',
    okText2:'CONFIRM — Haan Chat Delete Karo',
    onConfirm: function(){aiHist[aiCur]=[SYS];renderChat();}
  });
}
function chatKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();chatSend();}}
function chatResize(el){el.style.height='42px';el.style.height=Math.min(el.scrollHeight,110)+'px';}
renderChat();

// ═══════════════════════════════════════
// 🍅 POMODORO TIMER
// ═══════════════════════════════════════
var pomOn=false, pomPhase='study', pomSec=0, pomIv=null;
var POM_STUDY=25*60, POM_BREAK=5*60;
var POM_MSGS=['IIT gate ke paas pohonch raha hai tu 🔥','Ek sawal aur solve kar, haan tu kar sakta hai!','Physics formulas yad ho rahi hain? Chal chal!','Concentrate. 25 minutes. Sab kuch baad mein.','Topper wahi hota hai jo bitha rehta hai. Baith!'];

function togglePomodoro(){
  pomOn=document.getElementById('pomToggle').checked;
  var info=document.getElementById('pomInfo');
  var phase=document.getElementById('pomPhaseLabel');
  if(pomOn){
    info.textContent='ON — 25+5 min';
    phase.style.display='inline-block';
    pomPhase='study'; pomSec=POM_STUDY;
    updatePomDisplay();
  } else {
    info.textContent='OFF';
    phase.style.display='none';
    clearInterval(pomIv); pomIv=null;
    // restore normal timer display
    var sd=document.getElementById('studyDisp'); if(sd) sd.textContent=fmtHMS(studySec);
  }
}

function updatePomDisplay(){
  var phase=document.getElementById('pomPhaseLabel');
  if(pomPhase==='study'){
    phase.textContent='📚 STUDY PHASE — '+Math.ceil(pomSec/60)+' min left';
    phase.className='pom-phase study';
  } else {
    phase.textContent='☕ BREAK TIME — '+Math.ceil(pomSec/60)+' min left';
    phase.className='pom-phase brk';
  }
  var sd=document.getElementById('studyDisp'); if(sd) sd.textContent=p2(Math.floor(pomSec/60))+':'+p2(pomSec%60)+':00';
}

// Hook into study timer — override display when pomodoro is on
var _origTogStudy = null;
(function(){
  _origTogStudy = window.togStudyTimerPom;
})();

function togStudyTimer(){
  studyOn=!studyOn;
  var btn=document.getElementById('studyStartBtn');
  if(studyOn){
    btn.className='t-btn pause'; btn.textContent='\u23F8 Pause';
    if(pomOn){
      // Pomodoro mode
      clearInterval(pomIv);
      pomIv=setInterval(function(){
        pomSec--;
        if(pomSec<=0){
          // Phase switch
          if(pomPhase==='study'){
            pomPhase='break'; pomSec=POM_BREAK;
            // vibrate if supported
            if(navigator.vibrate) navigator.vibrate([200,100,200]);
          } else {
            pomPhase='study'; pomSec=POM_STUDY;
            if(navigator.vibrate) navigator.vibrate(300);
          }
        }
        updatePomDisplay();
        // Also track study time in study phase
        if(pomPhase==='study'){
          studySec++;
          var k=today();
          if(!studyData[k]) studyData[k]={physics:0,chemistry:0,maths:0};
          studyData[k][curSub]=(studyData[k][curSub]||0)+1;
          if(studySec%30===0){ saveLocal(); window.FS.saveStudy(studyData); }
        }
        // Update deep work if active
        if(document.body.classList.contains('deep-work')){
          var dw=document.getElementById('dwTime'); if(dw) dw.textContent=p2(Math.floor(pomSec/60))+':'+p2(pomSec%60)+':00';
        }
      },1000);
    } else {
      // Normal mode
      studyIv=setInterval(function(){
        studySec++;
        var el=document.getElementById('studyDisp'); if(el) el.textContent=fmtHMS(studySec);
        var k=today();
        if(!studyData[k]) studyData[k]={physics:0,chemistry:0,maths:0};
        studyData[k][curSub]=(studyData[k][curSub]||0)+1;
        if(studySec%30===0){ saveLocal(); saveTimerState(); window.FS.saveStudy(studyData); renderStudyUI(); }
        if(document.body.classList.contains('deep-work')){
          var dw=document.getElementById('dwTime'); if(dw) dw.textContent=fmtHMS(studySec);
        }
      },1000);
    }
  } else {
    btn.className='t-btn start'; btn.textContent='\u25B6 Start';
    clearInterval(studyIv); clearInterval(pomIv);
    saveLocal(); saveTimerState(); window.FS.saveStudy(studyData); renderStudyUI();
  }
}
function rstStudyTimer(){
  studyOn=false; studySec=0; clearInterval(studyIv); clearInterval(pomIv);
  pomPhase='study'; pomSec=POM_STUDY;
  var el=document.getElementById('studyDisp'); if(el) el.textContent='00:00:00';
  var btn=document.getElementById('studyStartBtn');
  if(btn){btn.className='t-btn start';btn.textContent='\u25B6 Start';}
  if(pomOn) updatePomDisplay();
  saveTimerState();
}

// ═══════════════════════════════════════
// 🎯 DEEP WORK MODE
// ═══════════════════════════════════════
function enterDeepWork(){
  if(!studyOn){ alert('Pehle timer start karo!'); return; }
  document.body.classList.add('deep-work');
  var idx=Math.floor(Math.random()*POM_MSGS.length);
  var msg=document.getElementById('dwMsg'); if(msg) msg.textContent=POM_MSGS[idx];
  var dw=document.getElementById('dwTime');
  if(dw) dw.textContent=pomOn?(p2(Math.floor(pomSec/60))+':'+p2(pomSec%60)+':00'):fmtHMS(studySec);
}
function exitDeepWork(){
  document.body.classList.remove('deep-work');
}

// ═══════════════════════════════════════
// ✅ DAILY CHECKLIST
// ═══════════════════════════════════════
function renderChecklist(){
  var el=document.getElementById('checklistItems'); if(!el)return;
  if(!checklist.length){
    el.innerHTML='<div style="text-align:center;color:var(--text3);font-size:13px;padding:14px 0;">Koi task nahi — niche add karo! 👇</div>';
    return;
  }
  var html='';
  checklist.forEach(function(item,i){
    html+='<div class="chk-item'+(item.done?' done-chk':'')+'" onclick="toggleChkItem('+i+')">'
      +'<div class="chk-box">'+(item.done?'✓':'')+'</div>'
      +'<div class="chk-text">'+item.text+'</div>'
      +'<button onclick="event.stopPropagation();deleteChkItem('+i+')" style="background:transparent;border:none;color:var(--text3);font-size:16px;cursor:pointer;padding:0 4px;line-height:1;">×</button>'
      +'</div>';
  });
  el.innerHTML=html;
}
function addChecklistItem(){
  var inp=document.getElementById('newTaskInp');
  var text=inp.value.trim(); if(!text) return;
  if(checklist.length>=10){ alert('Max 10 tasks!'); return; }
  checklist.push({text:text, done:false, addedAt:today()});
  inp.value='';
  saveLocal();
  if(!window._isGuest) window.FS.saveChecklist(checklist);
  renderChecklist();
  renderBadges();
}
function toggleChkItem(i){
  checklist[i].done=!checklist[i].done;
  saveLocal();
  if(!window._isGuest) window.FS.saveChecklist(checklist);
  renderChecklist(); renderBadges();
}
function deleteChkItem(i){
  var taskName = checklist[i] ? checklist[i].text : 'task';
  dconfirmShow({
    icon:'✅',
    title:'Task Delete?',
    msg:'"'+taskName+'" permanently delete ho jaayega.',
    title2:'Pakka delete karna hai?',
    msg2:'Yeh task list se hamesha ke liye hata diya jaayega!',
    okText:'Haan, Delete Karo',
    okText2:'CONFIRM — Haan Delete Karo',
    onConfirm: function(){
      checklist.splice(i,1);
      saveLocal();
      if(!window._isGuest) window.FS.saveChecklist(checklist);
      renderChecklist();
    }
  });
}

// ═══════════════════════════════════════
// 🏆 MILESTONE BADGES
// ═══════════════════════════════════════
var BADGES=[
  {id:'first_mock',ico:'🏁',name:'First Mock',sub:'Pehla mock lagaya!',check:function(){return mocks.length>=1;}},
  {id:'mock5',ico:'⚡',name:'5 Mocks Done',sub:'Keep going!',check:function(){return mocks.length>=5;}},
  {id:'mock25',ico:'🔥',name:'25 Mocks',sub:'Consistent grinder!',check:function(){return mocks.length>=25;}},
  {id:'streak3',ico:'🔥',name:'3 Day Streak',sub:'Tin din laga!',check:function(){return calcStreak()>=3;}},
  {id:'streak7',ico:'🏆',name:'7 Day Streak',sub:'Ek hafta solid!',check:function(){return calcStreak()>=7;}},
  {id:'streak30',ico:'👑',name:'30 Day Streak',sub:'Legend hai tu!',check:function(){return calcStreak()>=30;}},
  {id:'q100',ico:'📊',name:'100 Questions',sub:'100 sawal solve!',check:function(){var t=0;mocks.forEach(function(m){t+=m.qs||0;});return t>=100;}},
  {id:'q1000',ico:'🚀',name:'1000 Questions',sub:'Powerhouse!',check:function(){var t=0;mocks.forEach(function(m){t+=m.qs||0;});return t>=1000;}},
  {id:'syl25',ico:'📚',name:'Syllabus 25%',sub:'Ek chauthai done!',check:function(){var t=0,d=0;Object.keys(SYL).forEach(function(s){t+=SYL[s].chapters.length;for(var i=0;i<SYL[s].chapters.length;i++){if(done[s+i])d++;}});return t>0&&(d/t)>=0.25;}},
  {id:'syl50',ico:'🎯',name:'Syllabus 50%',sub:'Aadha ho gaya!',check:function(){var t=0,d=0;Object.keys(SYL).forEach(function(s){t+=SYL[s].chapters.length;for(var i=0;i<SYL[s].chapters.length;i++){if(done[s+i])d++;}});return t>0&&(d/t)>=0.5;}},
  {id:'acc80',ico:'🎯',name:'80% Accuracy',sub:'Bahut khoob!',check:function(){var t=0,c=0;mocks.forEach(function(m){t+=m.qs||0;c+=m.corr||0;});return t>=20&&(c/t)>=0.8;}},
  {id:'task_done',ico:'✅',name:'All Tasks Done',sub:'Aaj ka mission complete!',check:function(){return checklist.length>0&&checklist.every(function(t){return t.done;});}}
];
function renderBadges(){
  var el=document.getElementById('badgeGrid'); if(!el)return;
  var html='';
  BADGES.forEach(function(b){
    var earned=b.check();
    var bg=earned?'linear-gradient(135deg,#fef3c7,#fde68a)':'var(--bg)';
    html+='<div class="bdg '+(earned?'earned':'locked')+'" style="background:'+bg+';"><div class="bdg-ico">'+b.ico+'</div><div class="bdg-name">'+b.name+'</div><div class="bdg-sub">'+b.sub+'</div></div>';
  });
  el.innerHTML=html;
}

// ═══════════════════════════════════════
// 🔁 SPACED REPETITION REMINDERS
// ═══════════════════════════════════════
function renderSpacedRepReminders(){
  var el=document.getElementById('srList'), card=document.getElementById('srCard');
  if(!el||!card)return;
  var todayStr=today();
  var due=[];
  Object.keys(spacedRep).forEach(function(key){
    var sr=spacedRep[key]; if(!sr||!sr.doneDate)return;
    var idx=sr.nextIdx||0;
    if(idx>=sr.intervals.length)return; // all intervals done
    var doneD=new Date(sr.doneDate);
    var nextDate=new Date(doneD);
    nextDate.setDate(nextDate.getDate()+sr.intervals[idx]);
    var nextStr=nextDate.toISOString().split('T')[0];
    var diff=Math.ceil((nextDate-new Date(todayStr))/86400000);
    // Parse the key to get subject and chapter
    var parts=key.match(/^(physics|chemistry|maths)(\d+)$/);
    if(!parts)return;
    var sub=parts[1],chapIdx=parseInt(parts[2]),chName=SYL[sub].chapters[chapIdx];
    if(!chName)return;
    if(diff<=1){ due.push({key:key,ch:chName,sub:sub,diff:diff,nextStr:nextStr,sr:sr,idx:idx}); }
  });
  if(!due.length){ card.style.display='none'; return; }
  card.style.display='block';
  var html='';
  due.forEach(function(item){
    var tag=item.diff<=0?'today':'soon';
    var tagTxt=item.diff<=0?'⚠️ DUE TODAY!':'📅 Tomorrow';
    var subCols={physics:'#eef2ff',chemistry:'#fff7ed',maths:'#dcfce7'};
    var subTxt={physics:'⚡',chemistry:'🧪',maths:'📐'};
    html+='<div class="sr-item">'
      +'<span class="sr-due '+tag+'">'+tagTxt+'</span>'
      +'<div style="flex:1;font-size:13px;font-weight:700;">'+item.ch+'</div>'
      +'<span style="font-size:10px;padding:2px 7px;border-radius:4px;background:'+subCols[item.sub]+';font-weight:700;">'+subTxt[item.sub]+'</span>'
      +'<button onclick="markSRDone(\''+item.key+'\','+item.idx+')" style="background:var(--green);color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Inter\',sans-serif;">✓ Done</button>'
      +'</div>';
  });
  el.innerHTML=html;
}
function markSRDone(key,idx){
  if(!spacedRep[key])return;
  spacedRep[key].nextIdx=(idx+1);
  saveLocal();
  if(!window._isGuest) window.FS.saveSpacedRep(spacedRep);
  renderSpacedRepReminders();
}

// ═══════════════════════════════════════
// 🔥 WEAK SPOT HEATMAP
// ═══════════════════════════════════════
var hmFilter='all';
function setHMFilter(f,btn){
  hmFilter=f;
  document.querySelectorAll('#hmf-all,#hmf-physics,#hmf-chemistry,#hmf-maths').forEach(function(b){b.classList.remove('on');});
  if(btn) btn.classList.add('on');
  renderHeatmap();
}
function renderHeatmap(){
  var el=document.getElementById('heatmapList'), card=document.getElementById('heatmapCard');
  if(!el||!card)return;
  var keys=Object.keys(arenaChapterStats);
  if(hmFilter!=='all') keys=keys.filter(function(k){return arenaChapterStats[k].sub===hmFilter;});
  if(!keys.length){ card.style.display='none'; return; }
  card.style.display='block';
  // Sort by accuracy ascending (weakest first)
  keys.sort(function(a,b){
    var sa=arenaChapterStats[a], sb=arenaChapterStats[b];
    var aa=sa.attempted>0?sa.corr/sa.attempted:0;
    var ab=sb.attempted>0?sb.corr/sb.attempted:0;
    return aa-ab;
  });
  var html='';
  keys.forEach(function(ck){
    var s=arenaChapterStats[ck];
    var acc=s.attempted>0?Math.round((s.corr||0)/s.attempted*100):0;
    var bg=acc>=75?'#dcfce7':acc>=50?'#fef9c3':'#fee2e2';
    var barCol=acc>=75?'#86efac':acc>=50?'#fde047':'#fca5a5';
    var textCol=acc>=75?'#16a34a':acc>=50?'#854d0e':'#dc2626';
    var ACS_SC={physics:'#eef2ff',chemistry:'#fff7ed',maths:'#dcfce7'};
    var ACS_TC={physics:'#4f46e5',chemistry:'#ea580c',maths:'#16a34a'};
    var ACS_EM={physics:'⚡',chemistry:'🧪',maths:'📐'};
    html+='<div class="hm-cell" style="background:'+bg+';border:1px solid '+barCol+';">'
      +'<div class="hm-bar" style="width:'+acc+'%;background:'+barCol+';opacity:.3;"></div>'
      +'<div class="hm-label">'+s.ch+'</div>'
      +'<span class="hm-sub-tag" style="background:'+ACS_SC[s.sub]+';color:'+ACS_TC[s.sub]+';">'+ACS_EM[s.sub]+'</span>'
      +'<div class="hm-acc" style="color:'+textCol+';">'+acc+'%</div>'
      +'</div>';
  });
  el.innerHTML=html;
}

// ═══════════════════════════════════════
// 📒 MISTAKE LOG / ERROR BOOK
// ═══════════════════════════════════════
var currentMistakes=[];
function prepMistakeLog(qs, uAns, corrAns){
  var section=document.getElementById('mistakeLogSection');
  var container=document.getElementById('mistakeLogItems');
  if(!section||!container)return;
  currentMistakes=[];
  var html='';
  qs.forEach(function(q){
    var ua=uAns[q.id], ca=corrAns[q.id];
    if(!ua||!ca)return; // skip skipped
    var isWrong=false;
    if(ca.t==='MCQ'&&ua.t==='MCQ'&&ua.v!==ca.v) isWrong=true;
    if(ca.t==='NUM'){var uv=parseFloat(ua.v),cv=parseFloat(ca.v);if(!isNaN(uv)&&!isNaN(cv)&&Math.abs(uv-cv)>0.01)isWrong=true;}
    if(!isWrong)return;
    var mistakeId='m_'+Date.now()+'_'+q.id;
    currentMistakes.push({id:mistakeId, ch:q.ch, sub:q.sk, myAns:ua.t==='MCQ'?'Opt '+ua.v:ua.v, corrAns2:ca.t==='MCQ'?'Opt '+ca.v:ca.v, date:today(), note:''});
    html+='<div class="err-item" id="ei_'+mistakeId+'">'
      +'<div class="err-q">Q: '+q.ch+' | Mera: '+(ua.t==='MCQ'?'Opt '+ua.v:ua.v)+' | Sahi: '+(ca.t==='MCQ'?'Opt '+ca.v:ca.v)+'</div>'
      +'<textarea class="err-note" id="en_'+mistakeId+'" placeholder="Yahan galti ki wajah likhao... (optional)"></textarea>'
      +'</div>';
  });
  if(currentMistakes.length){
    section.style.display='block';
    container.innerHTML=html;
  } else {
    section.style.display='none';
  }
}
function saveMistakeLog(){
  currentMistakes.forEach(function(m){
    var inp=document.getElementById('en_'+m.id);
    m.note=inp?inp.value.trim():'';
  });
  // Add to global errorBook, avoid duplicates by id
  currentMistakes.forEach(function(m){
    errorBook.unshift(m);
  });
  if(errorBook.length>200) errorBook=errorBook.slice(0,200);
  saveLocal();
  if(!window._isGuest) window.FS.saveMistakes(errorBook);
  document.getElementById('mistakeLogSection').style.display='none';
  alert('✅ '+currentMistakes.length+' mistakes Error Book mein save ho gayi!');
  currentMistakes=[];
}
function renderErrorBook(){
  var el=document.getElementById('errorBookList'), card=document.getElementById('errorBookCard');
  if(!el||!card)return;
  if(!errorBook.length){ card.style.display='none'; return; }
  card.style.display='block';
  var ACS_SC2={physics:'#eef2ff',chemistry:'#fff7ed',maths:'#dcfce7'};
  var ACS_TC2={physics:'#4f46e5',chemistry:'#ea580c',maths:'#16a34a'};
  var html='';
  errorBook.slice(0,30).forEach(function(m){
    html+='<div style="background:var(--redlt);border:1px solid #fca5a5;border-radius:10px;padding:11px 12px;margin-bottom:7px;">'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">'
      +'<span style="background:'+ACS_SC2[m.sub]+';color:'+ACS_TC2[m.sub]+';font-size:10px;font-weight:700;padding:2px 7px;border-radius:4px;">'+(m.sub==='physics'?'⚡':m.sub==='chemistry'?'🧪':'📐')+'</span>'
      +'<div style="flex:1;font-size:13px;font-weight:700;color:var(--red);">'+m.ch+'</div>'
      +'<span style="font-size:10px;color:var(--text3);">'+m.date+'</span>'
      +'</div>'
      +'<div style="font-size:12px;color:var(--text2);">Mera: <b>'+m.myAns+'</b> | Sahi: <b style="color:var(--green);">'+m.corrAns2+'</b></div>'
      +(m.note?'<div style="font-size:12px;color:var(--text);margin-top:5px;padding:6px;background:#fff;border-radius:6px;">📝 '+m.note+'</div>':'')
      +'</div>';
  });
  if(errorBook.length>30) html+='<div style="text-align:center;font-size:12px;color:var(--text3);padding:8px;">...aur '+(errorBook.length-30)+' aur mistakes</div>';
  el.innerHTML=html;
}
function clearErrorBook(){
  dconfirmShow({
    icon:'📒',
    title:'Error Book Clear?',
    msg:'Saari saved mistakes permanently delete ho jaayengi.',
    title2:'Pakka clear karna hai?',
    msg2:'Error book bilkul khali ho jaayegi — undo nahi hoga!',
    okText:'Haan, Clear Karo',
    okText2:'CONFIRM — Haan Saari Mistakes Delete Karo',
    onConfirm: function(){
      errorBook=[];
      saveLocal();
      if(!window._isGuest) window.FS.saveMistakes(errorBook);
      renderErrorBook();
    }
  });
}

// ═══════════════════════════════════════
// 🃏 FLASHCARDS
// ═══════════════════════════════════════

function shiftTaskDate(dateISO, subCode){
  var parts = dateISO.split('-');
  var y = parseInt(parts[0]), m = parseInt(parts[1])-1, d = parseInt(parts[2]);
  if(subCode === 'P'){
    if(y === 2024) y = 2025;
    else if(y === 2025) y = 2027;
  } else {
    if(y === 2025) y = 2026;
    else if(y === 2026) y = 2027;
  }
  return new Date(y, m, d);
}

function getTaskLabel(subCode){
  var map = {P:'Physics',PC:'Phys. Chem',IC:'Inorg. Chem',OC:'Org. Chem',M:'Maths',TEST:'Test'};
  return map[subCode]||subCode;
}
function getTaskTagClass(subCode){
  var map = {P:'tag-phy',PC:'tag-pc',IC:'tag-ioc',OC:'tag-oc',M:'tag-math',TEST:'tag-test'};
  return map[subCode]||'tag-phy';
}
function getTaskEmoji(subCode){
  var map = {P:'⚡',PC:'🔬',IC:'⚗️',OC:'🌿',M:'📐',TEST:'📝'};
  return map[subCode]||'📖';
}
function fmtTaskDate(d){
  var days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return days[d.getDay()]+', '+d.getDate()+' '+months[d.getMonth()]+' '+d.getFullYear();
}

function buildTaskList(){
  var today = new Date(); today.setHours(0,0,0,0);
  var list = [];
  TASK_DATA_RAW.forEach(function(r, idx){
    var shifted = shiftTaskDate(r[0], r[1]);
    if(shifted >= today){
      var isTest = (r[1]==='TEST');
      list.push({
        id: 'task_'+idx,
        date: shifted,
        sub: r[1],
        chapter: r[2],
        topic: r[3],
        num: r[4],
        type: isTest ? 'test' : 'lecture',
        title: isTest ? r[2] : r[2]+' L'+r[4]+' — '+r[3]
      });
    }
  });
  list.sort(function(a,b){ return a.date-b.date; });
  return list;
}

function setTaskFilter(code, btn){
  taskFilterCurrent = code;
  tasksShowCount = TASKS_PAGE_SIZE;
  document.querySelectorAll('#taskFilters .acs-fbtn').forEach(function(b){ b.classList.remove('on'); });
  btn.classList.add('on');
  renderTasks();
}

function showMoreTasks(){
  tasksShowCount += 20;
  renderTasks();
}

function toggleTask(id){
  tasksDoneState[id] = !tasksDoneState[id];
  try{ localStorage.setItem('jee_tasks_done', JSON.stringify(tasksDoneState)); }catch(e){}
  renderTasks();
}

function renderTasks(){
  try{
    var raw = localStorage.getItem('jee_tasks_done');
    if(raw) tasksDoneState = JSON.parse(raw);
  }catch(e){}
  
  var all = buildTaskList();
  var filtered = taskFilterCurrent === 'all' ? all : all.filter(function(t){ return t.sub === taskFilterCurrent; });
  var total = filtered.length;
  var doneCount = filtered.filter(function(t){ return tasksDoneState[t.id]; }).length;
  
  document.getElementById('taskCounter').textContent = doneCount+'/'+total+' done';
  
  var shown = filtered.slice(0, tasksShowCount);
  var container = document.getElementById('tasksList');
  container.innerHTML = '';
  
  shown.forEach(function(task){
    var isDone = !!tasksDoneState[task.id];
    var div = document.createElement('div');
    div.className = 'task-item' + (isDone ? ' done' : '');
    div.onclick = function(){ toggleTask(task.id); };
    
    var chk = document.createElement('div');
    chk.className = 'task-chk';
    chk.textContent = isDone ? '✓' : '';
    
    var body = document.createElement('div');
    body.className = 'task-body';
    
    var dateDiv = document.createElement('div');
    dateDiv.className = 'task-date';
    dateDiv.textContent = fmtTaskDate(task.date);
    
    var titleDiv = document.createElement('div');
    titleDiv.className = 'task-title';
    titleDiv.textContent = (task.type==='test'?'📝 ':'📖 ') + task.title;
    
    var subDiv = document.createElement('div');
    subDiv.className = 'task-sub';
    var tagSpan = document.createElement('span');
    tagSpan.className = 'task-tag '+getTaskTagClass(task.sub);
    tagSpan.textContent = getTaskEmoji(task.sub)+' '+getTaskLabel(task.sub);
    if(task.type !== 'test'){
      tagSpan.textContent += ' • Lecture '+task.num;
    }
    subDiv.appendChild(tagSpan);
    
    body.appendChild(dateDiv);
    body.appendChild(titleDiv);
    body.appendChild(subDiv);
    div.appendChild(chk);
    div.appendChild(body);
    container.appendChild(div);
  });
  
  var moreBtn = document.getElementById('tasksMoreBtn');
  if(tasksShowCount < total){
    moreBtn.style.display = 'block';
    moreBtn.textContent = '⬇ See More ('+(total-tasksShowCount)+' more remaining)';
  } else {
    moreBtn.style.display = 'none';
  }
}

