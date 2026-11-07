'use client';
import {useEffect,useRef,useState} from 'react';
import {Play, RotateCcw, MoveRight} from 'lucide-react';

export function Simulation(){
  const [phase,setPhase]=useState<'rest'|'mix'|'recover'>('rest');
  const [level,setLevel]=useState(1);
  const [strength,setStrength]=useState(3);
  const [tau,setTau]=useState(6);
  const [auto,setAuto]=useState(false);
  const [trace,setTrace]=useState([{t:0,v:1}]);
  const current=useRef({t:0,v:1});
  const reset=()=>{current.current={t:0,v:1};setLevel(1);setTrace([{t:0,v:1}]);setAuto(false);setPhase('rest');};
  useEffect(()=>{
    if(phase==='rest'&&!auto)return;
    const timer=setInterval(()=>{
      const m=current.current;m.t+=0.1;
      const p=auto?(m.t<3?'rest':m.t<9?'mix':'recover'):phase;
      if(auto){setPhase(p);if(m.t>=30){setAuto(false);setPhase('rest');}}
      const shear=p==='mix'?strength:0;
      m.v=Math.max(0,Math.min(1,m.v+0.1*((1-m.v)/tau-0.4*shear*m.v)));
      setLevel(m.v);setTrace(old=>[...old.slice(-419),{t:m.t,v:m.v}]);
    },100);
    return()=>clearInterval(timer);
  },[phase,auto,strength,tau]);
  const choose=(p:'rest'|'mix'|'recover')=>{setAuto(false);if(p==='rest')reset();else setPhase(p);};
  const from=Math.max(0,(trace.at(-1)?.t||0)-42), to=Math.max(30,trace.at(-1)?.t||0);
  const path=trace.map((p,i)=>`${i?'L':'M'}${30+(p.t-from)/(to-from)*422},${124-p.v*100}`).join(' ');
  return <div className="simulation" id="model">
    <div className="sim-top"><span className="eyebrow">ИНТЕРАКТИВНАЯ МОДЕЛЬ</span><span className="live-dot">{phase==='mix'?'Перемешивание':phase==='recover'?'Восстановление':'Покой'}</span></div>
    <div className="vessel-wrap">
      <span className="vessel-note">{phase==='mix'?'Связи разрушаются':'Частицы образуют сетку'}<MoveRight size={18}/></span>
      <svg className={`vessel ${phase==='mix'?'mixing':''}`} viewBox="0 0 440 320" role="img" aria-label="Условная структура коллоидного геля: перемешивание разрушает связи, покой восстанавливает их">
        <defs><linearGradient id="gel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cdc6ff" stopOpacity=".55"/><stop offset="1" stopColor="#8b77e3" stopOpacity=".85"/></linearGradient><linearGradient id="glass"><stop stopColor="#fff" stopOpacity=".9"/><stop offset=".5" stopColor="#fff" stopOpacity=".08"/><stop offset="1" stopColor="#fff" stopOpacity=".7"/></linearGradient></defs>
        <ellipse cx="239" cy="288" rx="120" ry="13" fill="#6c5cad" opacity=".09"/>
        <path d="M137 61 L137 256 Q137 278 159 278 H308 Q330 278 330 256 V61" fill="url(#glass)" stroke="#a79cc3" strokeWidth="2"/>
        <path d="M141 130 Q235 115 326 130 V253 Q326 274 305 274 H162 Q141 274 141 253Z" fill="url(#gel)"/>
        <ellipse cx="234" cy="130" rx="93" ry="10" fill="#dcd6fa" stroke="#a797d9"/>
        <g className="particles">{Array.from({length:35},(_,i)=>{const col=i%7,row=Math.floor(i/7),x=158+col*25+(row%2)*5,y=153+row*24;return <g key={i}>{col<6&&<line x1={x} y1={y} x2={x+25} y2={y} stroke="#7560ba" strokeWidth="1.4" opacity={level*.75}/>} {row<4&&<line x1={x} y1={y} x2={x+(row%2?-5:5)} y2={y+24} stroke="#7560ba" strokeWidth="1.4" opacity={level*.7}/>}<ellipse cx={x} cy={y} rx="7" ry="3" transform={`rotate(${i*37%150} ${x} ${y})`} fill="#7055b6" opacity=".85"/></g>;})}</g>
        <path d="M134 60 Q234 43 334 60" fill="none" stroke="#a79cc3" strokeWidth="2"/><path d="M149 72V251" stroke="white" strokeWidth="5" opacity=".6"/>
        {[100,150,200,250].map((y,i)=><g key={y}><path d={`M309 ${y}h12`} stroke="#9c8fba"/><text x="337" y={y+4} fontSize="9" fill="#93889f">{100-i*25}</text></g>)}
        {phase==='mix'&&<g className="rod"><path d="M242 13L218 242" stroke="#e8e3ee" strokeWidth="10" strokeLinecap="round"/><path d="M242 13L218 242" stroke="#aaa0bc" strokeWidth="2"/></g>}
      </svg>
      <div className="structure"><strong>{Math.round(level*100)}<small>%</small></strong><span>условная доля<br/>сохранившихся связей</span></div>
    </div>
    <div className="segmented" aria-label="Состояние модели">{(['rest','mix','recover'] as const).map((p,i)=><button key={p} className={phase===p?'selected':''} aria-pressed={phase===p} onClick={()=>choose(p)}>{['Покой','Перемешать','Восстановить'][i]}</button>)}</div>
    <div className="chart-heading"><span>Структура λ</span><span>условное время</span></div>
    <svg className="model-chart" viewBox="0 0 470 145" role="img" aria-label="График условной доли связей во времени"><line x1="30" y1="24" x2="452" y2="24" stroke="#e4dfed" strokeDasharray="3 5"/><line x1="30" y1="74" x2="452" y2="74" stroke="#e4dfed" strokeDasharray="3 5"/><line x1="30" y1="124" x2="452" y2="124" stroke="#d8d2e5"/><text x="3" y="28">1</text><text x="3" y="128">0</text><path d={path} fill="none" stroke="#7551c9" strokeWidth="2.8" strokeLinejoin="round"/><text x="30" y="142">{Math.round(from)}</text><text x="436" y="142">{Math.round(to)}</text></svg>
    <div className="sim-actions"><button className="button small" onClick={()=>{reset();setAuto(true);}}><Play size={14}/>{auto?'Начать цикл заново':'Показать полный цикл'}</button><button className="icon-button" onClick={reset} aria-label="Сбросить модель"><RotateCcw size={17}/></button></div>
    <details className="model-settings"><summary>Изменить параметры модели</summary><label>Интенсивность перемешивания <b>{strength}</b><input type="range" min="1" max="5" step="1" value={strength} onChange={e=>setStrength(+e.target.value)}/></label><label>Время восстановления τ <b>{tau}</b><input type="range" min="2" max="12" step="1" value={tau} onChange={e=>setTau(+e.target.value)}/></label><p>Условная кинетика: dλ/dt = (1 − λ)/τ − 0,4·s·λ. При перемешивании s задаётся ползунком, в покое s = 0.</p></details>
    <p className="model-disclaimer">Учебная иллюстрация, не измерения. Числа и скорость анимации не предсказывают свойства рецептур или реальное время опыта.</p>
  </div>;
}
