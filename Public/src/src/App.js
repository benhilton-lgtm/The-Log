import { useState, useEffect, useCallback, useRef } from "react";

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const TYPE_LABELS = { film: 'Film', tv: 'TV', book: 'Book' };

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --bg:#0D0D0D; --surface:#161616; --border:#252525; --text:#F0EBE1; --muted:#7A7570; --accent:#E8A020; --accent-dim:#3D2A08; --red:#C0392B; --film:#4A9EBF; --tv:#7B68EE; --book:#6AAB69; }
  .app { background:var(--bg); color:var(--text); font-family:'Inter',sans-serif; font-weight:300; min-height:100vh; line-height:1.5; }
  header { border-bottom:1px solid var(--border); padding:16px 24px; display:flex; align-items:center; gap:16px; position:sticky; top:0; background:rgba(13,13,13,0.96); backdrop-filter:blur(8px); z-index:100; flex-wrap:wrap; }
  .logo { font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:400; }
  .logo em { color:var(--accent); font-style:italic; }
  .sync-status { font-family:'JetBrains Mono',monospace; font-size:0.6rem; letter-spacing:0.08em; text-transform:uppercase; padding:3px 8px; border-radius:2px; }
  .sync-idle{color:var(--muted);} .sync-saving{color:var(--accent);background:var(--accent-dim);} .sync-ok{color:var(--book);background:rgba(106,171,105,0.12);} .sync-err{color:var(--red);background:rgba(192,57,43,0.12);}
  nav { display:flex; gap:3px; margin-left:auto; }
  nav button { background:none; border:1px solid transparent; color:var(--muted); font-family:'JetBrains Mono',monospace; font-size:0.65rem; letter-spacing:0.08em; text-transform:uppercase; padding:5px 12px; cursor:pointer; border-radius:2px; transition:all 0.15s; }
  nav button:hover { color:var(--text); border-color:var(--border); }
  nav button.active { color:var(--accent); border-color:var(--accent-dim); background:var(--accent-dim); }
  .view { max-width:820px; margin:0 auto; padding:28px 24px; }
  .add-form { background:var(--surface); border:1px solid var(--border); border-radius:4px; padding:16px; margin-bottom:24px; }
  .form-row { display:flex; gap:8px; flex-wrap:wrap; }
  input,select { background:var(--bg); border:1px solid var(--border); color:var(--text); font-family:'Inter',sans-serif; font-size:0.82rem; font-weight:300; padding:7px 11px; border-radius:3px; outline:none; transition:border-color 0.15s; }
  input::placeholder{color:var(--muted);} input:focus,select:focus{border-color:var(--accent);} select option{background:var(--surface);}
  .input-title{flex:2;min-width:130px;} .input-creator{flex:1;min-width:100px;} .input-date{width:130px;}
  .btn-add { background:var(--accent); color:#0D0D0D; border:none; font-family:'JetBrains Mono',monospace; font-size:0.65rem; letter-spacing:0.08em; text-transform:uppercase; font-weight:500; padding:7px 16px; border-radius:3px; cursor:pointer; transition:opacity 0.15s; white-space:nowrap; }
  .btn-add:hover{opacity:0.85;}
  .filter-bar { display:flex; gap:6px; margin-bottom:18px; flex-wrap:wrap; align-items:center; }
  .filter-btn { background:none; border:1px solid var(--border); color:var(--muted); font-family:'JetBrains Mono',monospace; font-size:0.6rem; letter-spacing:0.08em; text-transform:uppercase; padding:4px 10px; cursor:pointer; border-radius:2px; transition:all 0.15s; }
  .filter-btn:hover{color:var(--text);} .filter-btn.active{color:var(--accent);border-color:var(--accent-dim);background:var(--accent-dim);}
  .search-in{margin-left:auto;width:150px;font-size:0.76rem;}
  .log-list{display:flex;flex-direction:column;gap:2px;}
  .log-entry{display:grid;grid-template-columns:84px 1fr auto;align-items:center;gap:14px;padding:10px 12px;border-radius:3px;transition:background 0.1s;}
  .log-entry:hover{background:var(--surface);}
  .log-date{font-family:'JetBrains Mono',monospace;font-size:0.66rem;color:var(--accent);white-space:nowrap;}
  .log-title{font-family:'Playfair Display',serif;font-size:0.9rem;}
  .log-creator{font-family:'Inter',sans-serif;font-size:0.7rem;color:var(--muted);font-weight:300;margin-left:7px;}
  .type-badge{font-family:'JetBrains Mono',monospace;font-size:0.56rem;letter-spacing:0.1em;text-transform:uppercase;padding:2px 6px;border-radius:2px;font-weight:500;}
  .type-film{color:var(--film);background:rgba(74,158,191,0.12);} .type-tv{color:var(--tv);background:rgba(123,104,238,0.12);} .type-book{color:var(--book);background:rgba(106,171,105,0.12);}
  .del-btn{background:none;border:none;color:transparent;font-size:1rem;cursor:pointer;padding:0 3px;line-height:1;transition:color 0.15s;}
  .log-entry:hover .del-btn{color:var(--border);} .del-btn:hover{color:var(--red)!important;}
  .empty{color:var(--muted);font-family:'JetBrains Mono',monospace;font-size:0.7rem;letter-spacing:0.05em;padding:28px 12px;text-align:center;}
  .section-label{font-family:'JetBrains Mono',monospace;font-size:0.6rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);margin-bottom:14px;margin-top:22px;}
  .watchlist{display:flex;flex-direction:column;gap:2px;}
  .watch-item{display:flex;align-items:center;gap:10px;padding:8px 11px;border-radius:3px;transition:background 0.1s;}
  .watch-item:hover{background:var(--surface);}
  .watch-check{width:14px;height:14px;border:1px solid var(--border);border-radius:2px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.15s;font-size:0.6rem;color:transparent;}
  .watch-check:hover{border-color:var(--accent);color:var(--accent);}
  .watch-title{font-family:'Playfair Display',serif;font-size:0.86rem;flex:1;}
  .watch-add{display:flex;gap:8px;margin-bottom:14px;} .watch-add input{flex:1;}
  .btn-sm{background:none;border:1px solid var(--border);color:var(--text);font-family:'JetBrains Mono',monospace;font-size:0.6rem;letter-spacing:0.08em;text-transform:uppercase;padding:7px 12px;border-radius:3px;cursor:pointer;transition:all 0.15s;white-space:nowrap;}
  .btn-sm:hover{border-color:var(--accent);color:var(--accent);}
  .year-heading{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:400;font-style:italic;color:var(--accent);margin-bottom:4px;}
  .year-sub{font-family:'JetBrains Mono',monospace;font-size:0.62rem;color:var(--muted);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:32px;}
  .year-controls{display:flex;align-items:center;gap:12px;margin-bottom:16px;}
  .year-count{font-family:'JetBrains Mono',monospace;font-size:0.62rem;color:var(--muted);margin-left:auto;}
  .year-section{margin-bottom:32px;}
  .year-section-title{font-family:'JetBrains Mono',monospace;font-size:0.6rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border);padding-bottom:6px;margin-bottom:12px;}
  .year-item{display:flex;justify-content:space-between;align-items:baseline;padding:6px 0;border-bottom:1px solid rgba(37,37,37,0.5);gap:12px;}
  .year-item-title{font-family:'Playfair Display',serif;font-size:0.9rem;}
  .year-item-title small{font-family:'Inter',sans-serif;font-size:0.7rem;color:var(--muted);font-style:italic;margin-left:5px;}
  .year-item-right{display:flex;align-items:center;gap:7px;flex-shrink:0;}
  .year-item-date{font-family:'JetBrains Mono',monospace;font-size:0.66rem;color:var(--accent);}
  .loading{display:flex;align-items:center;justify-content:center;min-height:80vh;flex-direction:column;}
  .spinner{width:26px;height:26px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px;}
  .loading p{font-family:'JetBrains Mono',monospace;font-size:0.7rem;color:var(--muted);letter-spacing:0.1em;text-transform:uppercase;}
  @keyframes spin{to{transform:rotate(360deg);}}
`;

const STORAGE_KEY = 'the-log-data';

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { log: [], watchlist: [] }; }
  catch { return { log: [], watchlist: [] }; }
}

function saveLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function App() {
  const [log, setLog] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [view, setView] = useState("log");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [yearSel, setYearSel] = useState("");
  const [logTitle, setLogTitle] = useState("");
  const [logCreator, setLogCreator] = useState("");
  const [logType, setLogType] = useState("film");
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [watchTitle, setWatchTitle] = useState("");
  const [watchType, setWatchType] = useState("film");
  const latest = useRef({ log: [], watchlist: [] });
  useEffect(() => { latest.current = { log, watchlist }; }, [log, watchlist]);

  useEffect(() => {
    const data = loadLocal();
    setLog(data.log || []);
    setWatchlist(data.watchlist || []);
  }, []);

  const persist = useCallback((l, w) => {
    saveLocal({ log: l, watchlist: w });
  }, []);

  const updateLog = l => { setLog(l); persist(l, latest.current.watchlist); };
  const updateWl  = w => { setWatchlist(w); persist(latest.current.log, w); };

  const addLogEntry = () => {
    if (!logTitle.trim() || !logDate) return;
    updateLog([{ id: Date.now(), title: logTitle.trim(), creator: logCreator.trim(), type: logType, date: logDate }, ...log]);
    setLogTitle(""); setLogCreator("");
  };

  const addWatchItem = () => {
    if (!watchTitle.trim()) return;
    updateWl([...watchlist, { id: Date.now(), title: watchTitle.trim(), type: watchType }]);
    setWatchTitle("");
  };

  const markWatched = id => {
    const item = watchlist.find(w => w.id === id);
    if (!item) return;
    const nl = [{ id: Date.now(), title: item.title, creator: "", type: item.type, date: new Date().toISOString().split("T")[0] }, ...log];
    const nw = watchlist.filter(w => w.id !== id);
    setLog(nl); setWatchlist(nw); persist(nl, nw); setView("log");
  };

  const fmtDate = d => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"2-digit" }).toUpperCase();

  const filtered = log.filter(e => {
    if (filter !== "all" && e.type !== filter) return false;
    const s = search.toLowerCase();
    return !s || e.title.toLowerCase().includes(s) || (e.creator||"").toLowerCase().includes(s);
  });

  const years = [...new Set(log.map(e => e.date.slice(0,4)))].sort((a,b) => b-a);
  const curYear = yearSel || years[0] || String(new Date().getFullYear());
  const yearEntries = log.filter(e => e.date.startsWith(curYear)).sort((a,b) => a.date.localeCompare(b.date));
  const byMonth = {};
  yearEntries.forEach(e => { const m = +e.date.slice(5,7)-1; (byMonth[m]||(byMonth[m]=[])).push(e); });

  return <>
    <style>{css}</style>
    <div className="app">
      <header>
        <span className="logo">The <em>Log</em></span>
        <nav>
          {["log","watchlist","year"].map(v =>
            <button key={v} className={view===v?"active":""} onClick={()=>setView(v)}>
              {v==="year"?"Year in Review":v[0].toUpperCase()+v.slice(1)}
            </button>
          )}
        </nav>
      </header>

      {view==="log" && <div className="view">
        <div className="add-form"><div className="form-row">
          <input className="input-title" value={logTitle} onChange={e=>setLogTitle(e.target.value)} placeholder="Title" onKeyDown={e=>e.key==="Enter"&&addLogEntry()}/>
          <input className="input-creator" value={logCreator} onChange={e=>setLogCreator(e.target.value)} placeholder="Director / Author / Show" onKeyDown={e=>e.key==="Enter"&&addLogEntry()}/>
          <select value={logType} onChange={e=>setLogType(e.target.value)}><option value="film">Film</option><option value="tv">TV</option><option value="book">Book</option></select>
          <input className="input-date" type="date" value={logDate} onChange={e=>setLogDate(e.target.value)}/>
          <button className="btn-add" onClick={addLogEntry}>+ Add to Log</button>
        </div></div>
        <div className="filter-bar">
          {["all","film","tv","book"].map(f=><button key={f} className={`filter-btn${filter===f?" active":""}`} onClick={()=>setFilter(f)}>{f==="all"?"All":TYPE_LABELS[f]+"s"}</button>)}
          <input className="search-in" type="text" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="log-list">
          {filtered.length===0 ? <div className="empty">Nothing here yet.</div> : filtered.map(e=>
            <div className="log-entry" key={e.id}>
              <span className="log-date">{fmtDate(e.date)}</span>
              <span className="log-title">{e.title}{e.creator&&<span className="log-creator">{e.creator}</span>}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span className={`type-badge type-${e.type}`}>{TYPE_LABELS[e.type]}</span>
                <button className="del-btn" onClick={()=>updateLog(log.filter(x=>x.id!==e.id))}>×</button>
              </div>
            </div>
          )}
        </div>
      </div>}

      {view==="watchlist" && <div className="view" style={{maxWidth:540}}>
        <div className="watch-add">
          <input value={watchTitle} onChange={e=>setWatchTitle(e.target.value)} placeholder="Add a title…" onKeyDown={e=>e.key==="Enter"&&addWatchItem()}/>
          <select value={watchType} onChange={e=>setWatchType(e.target.value)}><option value="film">Film</option><option value="tv">TV</option><option value="book">Book</option></select>
          <button className="btn-sm" onClick={addWatchItem}>Add</button>
        </div>
        {["film","tv","book"].map(type=>{
          const items=watchlist.filter(w=>w.type===type);
          if(!items.length) return null;
          return <div key={type}>
            <div className="section-label">{TYPE_LABELS[type]}s</div>
            <div className="watchlist">{items.map(w=>
              <div className="watch-item" key={w.id}>
                <div className="watch-check" onClick={()=>markWatched(w.id)}>✓</div>
                <span className="watch-title">{w.title}</span>
                <span className={`type-badge type-${w.type}`} style={{fontSize:"0.52rem"}}>{TYPE_LABELS[w.type]}</span>
                <button className="del-btn" style={{color:"var(--border)"}} onClick={()=>updateWl(watchlist.filter(x=>x.id!==w.id))}>×</button>
              </div>
            )}</div>
          </div>;
        })}
        {watchlist.length===0&&<div className="empty">Your watchlist is empty.</div>}
      </div>}

      {view==="year" && <div className="view" style={{maxWidth:640}}>
        <div className="year-controls">
          <select value={curYear} onChange={e=>setYearSel(e.target.value)} style={{width:86,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.82rem"}}>
            {(years.length?years:[String(new Date().getFullYear())]).map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <span className="year-count">{yearEntries.length} {yearEntries.length===1?"entry":"entries"}</span>
        </div>
        <div className="year-heading">{curYear}</div>
        <div className="year-sub">A log of everything watched &amp; read</div>
        {yearEntries.length===0 ? <div className="empty">No entries for this year.</div>
        : Object.keys(byMonth).sort((a,b)=>a-b).map(m=>
          <div className="year-section" key={m}>
            <div className="year-section-title">{MONTHS[m]} — {byMonth[m].length}</div>
            {byMonth[m].map(e=>{
              const day=new Date(e.date+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit"});
              return <div className="year-item" key={e.id}>
                <span className="year-item-title">{e.title}{e.creator&&<small>{e.creator}</small>}</span>
                <div className="year-item-right">
                  <span className={`type-badge type-${e.type}`} style={{fontSize:"0.52rem"}}>{TYPE_LABELS[e.type]}</span>
                  <span className="year-item-date">{day}</span>
                </div>
              </div>;
            })}
          </div>
        )}
      </div>}
    </div>
  </>;
}
