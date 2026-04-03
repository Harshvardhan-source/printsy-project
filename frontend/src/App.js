import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from './api';

const G = {
  bg:'#0A0A0A',card:'#111111',card2:'#181818',border:'#1E1E1E',border2:'#252525',
  green:'#22C55E',greenDark:'#16A34A',greenBg:'#052E1C',greenBdr:'#166534',
  text:'#EEEEEE',text2:'#888888',text3:'#444444',
  red:'#EF4444',redBg:'#200A0A',redBdr:'#450A0A',
  amber:'#F59E0B',amberBg:'#2D1F00',purple:'#818CF8',purpleBg:'#1A1040',purpleBdr:'#2D1A50',
};
const css = {
  app:{minHeight:'100vh',background:G.bg,color:G.text,fontFamily:"'Inter',sans-serif",fontSize:14},
  center:{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',padding:16},
  col:{display:'flex',flexDirection:'column',gap:12},
  row:{display:'flex',alignItems:'center',gap:8},
  card:{background:G.card,border:`1px solid ${G.border}`,borderRadius:16,padding:20},
  card2:{background:G.card2,border:`1px solid ${G.border2}`,borderRadius:12,padding:16},
  authWrap:{width:'100%',maxWidth:400},
  brand:{textAlign:'center',marginBottom:32},
  brandIcon:{width:72,height:72,borderRadius:20,background:G.greenBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,margin:'0 auto 16px',border:`1px solid ${G.greenBdr}`},
  brandName:{fontSize:32,fontWeight:900,color:G.green,letterSpacing:0.5},
  brandSub:{fontSize:13,color:G.text3,marginTop:6},
  formTitle:{fontSize:22,fontWeight:800,color:G.text,marginBottom:20},
  label:{fontSize:11,fontWeight:700,color:G.text3,textTransform:'uppercase',letterSpacing:0.8,marginBottom:6,display:'block'},
  input:{width:'100%',background:G.card2,border:`1px solid ${G.border2}`,borderRadius:10,padding:'13px 14px',fontSize:15,color:G.text,outline:'none',boxSizing:'border-box'},
  btn:{width:'100%',background:G.greenDark,color:'#fff',border:'none',borderRadius:10,padding:'15px 20px',fontSize:16,fontWeight:700,cursor:'pointer'},
  btnSm:{background:G.greenDark,color:'#fff',border:'none',borderRadius:8,padding:'10px 18px',fontSize:13,fontWeight:600,cursor:'pointer'},
  btnGhost:{background:'transparent',color:G.green,border:`1px solid ${G.border}`,borderRadius:10,padding:'13px 20px',fontSize:14,fontWeight:600,cursor:'pointer',width:'100%'},
  link:{color:G.green,cursor:'pointer',fontWeight:600},
  linkText:{fontSize:13,color:G.text3,textAlign:'center'},
  err:{background:G.redBg,border:`1px solid ${G.redBdr}`,borderRadius:8,padding:'10px 14px',fontSize:13,color:G.red},
  ok:{background:G.greenBg,border:`1px solid ${G.greenBdr}`,borderRadius:8,padding:'10px 14px',fontSize:13,color:G.green},
  nav:{background:'#0F0F0F',borderBottom:`1px solid ${G.border}`,padding:'0 20px',display:'flex',alignItems:'center',justifyContent:'space-between',height:56,position:'sticky',top:0,zIndex:100},
  navBrand:{fontSize:20,fontWeight:900,color:G.green},
  navRight:{display:'flex',alignItems:'center',gap:12},
  tabBar:{position:'fixed',bottom:0,left:0,right:0,background:'#0F0F0F',borderTop:`1px solid ${G.border}`,display:'flex',zIndex:100},
  tabItem:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'10px 0',cursor:'pointer',fontSize:10,fontWeight:600,gap:4},
  page:{maxWidth:480,margin:'0 auto',padding:'20px 16px 90px'},
  pageTitle:{fontSize:26,fontWeight:800,color:G.text,marginBottom:20},
  sectionLabel:{fontSize:11,fontWeight:700,color:G.text3,textTransform:'uppercase',letterSpacing:0.8,marginBottom:10,display:'block'},
  badge:{borderRadius:20,padding:'3px 10px',fontSize:10,fontWeight:700,display:'inline-block'},
};
const STATUS_STYLE = {
  pending_payment:{bg:G.amberBg,color:G.amber,label:'Awaiting payment',icon:'💳'},
  queued:{bg:G.purpleBg,color:G.purple,label:'In queue',icon:'⏳'},
  printing:{bg:G.greenBg,color:G.green,label:'Printing',icon:'🖨️'},
  ready:{bg:G.greenBg,color:G.green,label:'Ready for pickup',icon:'✅'},
  collected:{bg:'#1A1A1A',color:G.text3,label:'Collected',icon:'📦'},
  cancelled:{bg:G.redBg,color:G.red,label:'Cancelled',icon:'❌'},
  failed:{bg:G.redBg,color:G.red,label:'Failed',icon:'⚠️'},
};
const ALLOWED_EXT=['.pdf','.doc','.docx','.jpg','.jpeg','.png'];
const MAX_MB=50;
const EXT_ICONS={pdf:'📕',doc:'📘',docx:'📘',jpg:'🖼️',jpeg:'🖼️',png:'🖼️'};
const getFileIcon=(name)=>EXT_ICONS[(name||'').split('.').pop()?.toLowerCase()]||'📄';
const fmtSize=(b)=>b<1024*1024?(b/1024).toFixed(1)+' KB':(b/(1024*1024)).toFixed(1)+' MB';

function Spinner(){return(<div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:40}}><div style={{width:32,height:32,border:`3px solid ${G.border}`,borderTop:`3px solid ${G.green}`,borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>);}
function Alert({msg,type='error'}){if(!msg)return null;return <div style={type==='error'?css.err:css.ok}>{msg}</div>;}
function BackBtn({onClick}){return(<button style={{background:'none',border:'none',color:G.green,cursor:'pointer',fontSize:14,fontWeight:600,marginBottom:20,padding:0}}onClick={onClick}>← Back</button>);}
function TabBar({active,onNav}){const tabs=[{id:'home',icon:'🏠',label:'Home'},{id:'jobs',icon:'📄',label:'My Jobs'},{id:'shops',icon:'📍',label:'Shops'},{id:'profile',icon:'👤',label:'Profile'}];return(<div style={css.tabBar}>{tabs.map(t=>(<div key={t.id}style={{...css.tabItem,color:active===t.id?G.green:G.text3}}onClick={()=>onNav(t.id)}><span style={{fontSize:20}}>{t.icon}</span><span>{t.label}</span></div>))}</div>);}
function Chip({val,cur,onSet,label}){const active=cur===val;return(<button onClick={()=>onSet(val)}style={{padding:'9px 18px',borderRadius:8,border:`1.5px solid ${active?G.green:G.border2}`,background:active?G.greenBg:G.card2,color:active?G.green:G.text2,cursor:'pointer',fontWeight:600,fontSize:13}}>{label}</button>);}

function LoginScreen({onLogin,onGoRegister}){
  const[phone,setPhone]=useState('');const[password,setPassword]=useState('');const[err,setErr]=useState('');const[loading,setLoading]=useState(false);
  const submit=async(e)=>{e.preventDefault();if(!phone||!password){setErr('Phone and password are required');return;}setLoading(true);setErr('');try{const{data}=await api.post('/auth/login/',{phone,password});localStorage.setItem('token',data.token);localStorage.setItem('user',JSON.stringify(data.user));onLogin(data.user);}catch(e){setErr(e.response?.data?.error||'Login failed');}finally{setLoading(false);}};
  return(<div style={css.center}><div style={css.authWrap}><div style={css.brand}><div style={css.brandIcon}>🖨️</div><div style={css.brandName}>PrintShop</div><div style={css.brandSub}>Print anywhere. Pay once. Collect on the way.</div></div><div style={css.card}><div style={css.formTitle}>Sign in</div><form onSubmit={submit}style={css.col}><div><label style={css.label}>Phone number</label><input style={css.input}placeholder="10-digit mobile"type="tel"maxLength={10}value={phone}onChange={e=>setPhone(e.target.value)}/></div><div><label style={css.label}>Password</label><input style={css.input}placeholder="Your password"type="password"value={password}onChange={e=>setPassword(e.target.value)}/></div><Alert msg={err}/><button type="submit"style={{...css.btn,opacity:loading?0.6:1}}disabled={loading}>{loading?'Signing in…':'Sign in'}</button><div style={css.linkText}>No account? <span style={css.link}onClick={onGoRegister}>Sign up</span></div></form></div></div></div>);
}

function RegisterScreen({onLogin,onGoLogin}){
  const[name,setName]=useState('');const[phone,setPhone]=useState('');const[password,setPassword]=useState('');const[confirm,setConfirm]=useState('');const[err,setErr]=useState('');const[loading,setLoading]=useState(false);const[success,setSuccess]=useState(null);
  const submit=async(e)=>{e.preventDefault();if(!name||!phone||!password||!confirm){setErr('All fields are required');return;}if(password!==confirm){setErr('Passwords do not match');return;}if(password.length<12){setErr('Password must be at least 12 characters');return;}if(!/^\d{10}$/.test(phone)){setErr('Enter a valid 10-digit phone number');return;}setLoading(true);setErr('');try{const{data}=await api.post('/auth/register/',{name,phone,password});localStorage.setItem('token',data.token);localStorage.setItem('user',JSON.stringify(data.user));setSuccess(data.user);}catch(e){setErr(e.response?.data?.error||'Registration failed');}finally{setLoading(false);}};
  if(success)return(<div style={css.center}><div style={{...css.authWrap,textAlign:'center'}}><div style={css.card}><div style={{fontSize:48,marginBottom:16}}>🎉</div><div style={{fontSize:22,fontWeight:800,color:G.text,marginBottom:8}}>Account created!</div><div style={{fontSize:13,color:G.text3,marginBottom:24}}>Your PrintShop ID</div><div style={{background:G.greenBg,border:`1px solid ${G.greenBdr}`,borderRadius:16,padding:24,marginBottom:24}}><div style={{fontSize:11,color:'#4ADE80',marginBottom:8}}>YOUR ID (show at counter)</div><div style={{fontSize:56,fontWeight:900,color:G.green,letterSpacing:10}}>{success.short_id}</div><div style={{fontSize:14,color:'#4ADE80',marginTop:8}}>{success.name}</div></div><button style={css.btn}onClick={()=>onLogin(success)}>Continue to app →</button></div></div></div>);
  return(<div style={css.center}><div style={css.authWrap}><div style={css.brand}><div style={css.brandIcon}>🖨️</div><div style={css.brandName}>PrintShop</div></div><div style={css.card}><div style={css.formTitle}>Create account</div><form onSubmit={submit}style={css.col}><div><label style={css.label}>Full name</label><input style={css.input}placeholder="Your name"value={name}onChange={e=>setName(e.target.value)}/></div><div><label style={css.label}>Phone number</label><input style={css.input}placeholder="10-digit mobile"type="tel"maxLength={10}value={phone}onChange={e=>setPhone(e.target.value)}/></div><div><label style={css.label}>Password</label><input style={css.input}placeholder="Min 12 characters"type="password"value={password}onChange={e=>setPassword(e.target.value)}/></div><div><label style={css.label}>Confirm password</label><input style={css.input}placeholder="Repeat password"type="password"value={confirm}onChange={e=>setConfirm(e.target.value)}/></div><Alert msg={err}/><button type="submit"style={{...css.btn,opacity:loading?0.6:1}}disabled={loading}>{loading?'Creating account…':'Create account'}</button><div style={css.linkText}>Already have an account? <span style={css.link}onClick={onGoLogin}>Sign in</span></div></form></div></div></div>);
}

function HomeScreen({user,onNav}){
  const[jobs,setJobs]=useState([]);
  useEffect(()=>{api.get('/jobs/').then(r=>setJobs(r.data.jobs||[])).catch(()=>{});},[]);
  const active=jobs.filter(j=>!['collected','cancelled','failed'].includes(j.status));
  return(<div style={css.page}><div style={{...css.card,marginBottom:16,background:'#0D2D1F',border:`1px solid ${G.greenBdr}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}><div><div style={{fontSize:20,fontWeight:800,color:G.text}}>Hello, {user.name.split(' ')[0]} 👋</div><div style={{fontSize:13,color:'#4ADE80',marginTop:4}}>Your ID: <span style={{fontWeight:800,letterSpacing:2}}>{user.short_id}</span></div></div><button style={{...css.btnSm,background:'rgba(255,255,255,0.1)'}}onClick={()=>onNav('pickupid')}>Show ID</button></div><div style={{background:G.greenDark,borderRadius:16,padding:20,marginBottom:20,display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',border:`1px solid #166534`}}onClick={()=>onNav('upload')}><div style={css.row}><span style={{fontSize:28}}>🖨️</span><div><div style={{fontSize:17,fontWeight:700,color:'#fff'}}>New print job</div><div style={{fontSize:12,color:'rgba(255,255,255,0.6)',marginTop:2}}>Upload · Pay · Collect</div></div></div><span style={{fontSize:22,color:'#4ADE80',fontWeight:700}}>→</span></div>{active.length>0&&(<div style={{marginBottom:20}}><span style={css.sectionLabel}>Active jobs</span>{active.map(job=>{const st=STATUS_STYLE[job.status]||STATUS_STYLE.queued;return(<div key={job.id}style={{...css.card,marginBottom:8,display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}onClick={()=>onNav('jobs')}><span style={{fontSize:22}}>{st.icon}</span><div style={{flex:1}}><div style={{fontWeight:600,color:G.text,fontSize:14}}>{job.file_name}</div><div style={{fontSize:12,color:G.text3,marginTop:2}}>₹{job.amount}</div></div><span style={{...css.badge,background:st.bg,color:st.color}}>{st.label}</span></div>);})}</div>)}<span style={css.sectionLabel}>Quick actions</span><div style={css.col}>{[{icon:'📍',title:'Find a shop',sub:'Shops near you',color:'#1A4D30',bdr:'#1A4D30',nav:'shops'},{icon:'🪪',title:'My ID card',sub:'Show at counter',color:'#1A1040',bdr:'#2D1A50',nav:'pickupid'},{icon:'📋',title:'All print jobs',sub:'View history',color:'#1A1000',bdr:'#2D1A00',nav:'jobs'}].map(a=>(<div key={a.nav}style={{background:a.color,border:`1px solid ${a.bdr}`,borderRadius:14,padding:16,display:'flex',alignItems:'center',gap:14,cursor:'pointer'}}onClick={()=>onNav(a.nav)}><div style={{width:44,height:44,borderRadius:12,background:'rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{a.icon}</div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:G.text}}>{a.title}</div><div style={{fontSize:12,color:G.text3,marginTop:2}}>{a.sub}</div></div><span style={{color:G.text3,fontSize:16}}>→</span></div>))}</div></div>);
}

function JobsScreen({onNav}){
  const[jobs,setJobs]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{api.get('/jobs/').then(r=>setJobs(r.data.jobs||[])).finally(()=>setLoading(false));},[]);
  return(<div style={css.page}><div style={css.pageTitle}>My Jobs</div>{loading?<Spinner/>:jobs.length===0?(<div style={{textAlign:'center',padding:60,color:G.text3}}><div style={{fontSize:48,marginBottom:12}}>📄</div><div style={{fontSize:16,fontWeight:600}}>No jobs yet</div><div style={{fontSize:13,marginTop:6}}>Tap + New print job to get started</div><button style={{...css.btn,marginTop:20}}onClick={()=>onNav('upload')}>+ New print job</button></div>):jobs.map(job=>{const st=STATUS_STYLE[job.status]||STATUS_STYLE.queued;return(<div key={job.id}style={{...css.card,marginBottom:8,display:'flex',alignItems:'center',gap:12}}><div style={{width:42,height:42,borderRadius:10,background:G.card2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{st.icon}</div><div style={{flex:1}}><div style={{fontWeight:600,color:G.text,fontSize:14}}>{job.file_name}</div><div style={{fontSize:12,color:G.text3,marginTop:3}}>₹{job.amount} · {job.pages}p · {job.color_mode==='bw'?'B&W':'Color'} · {job.copies} {job.copies===1?'copy':'copies'}</div></div><span style={{...css.badge,background:st.bg,color:st.color}}>{st.label}</span></div>);})}</div>);
}

// ── DETECT PAGE COUNT FROM FILE ───────────────────────────────────────────────
async function detectPageCount(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  // PDF: use pdf.js loaded from CDN in index.html
  if (ext === 'pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      return pdf.numPages;
    } catch (e) {
      console.warn('pdf.js page count failed:', e);
      return null;
    }
  }
  // Images: always 1 page
  if (['jpg','jpeg','png'].includes(ext)) return 1;
  // DOCX/DOC: parse XML to count paragraphs as rough estimate
  if (['docx'].includes(ext)) {
    try {
      const ab = await file.arrayBuffer();
      const { default: JSZip } = await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm');
      const zip = await JSZip.loadAsync(ab);
      const xml = await zip.file('word/document.xml')?.async('string');
      if (!xml) return null;
      // Count <w:sectPr> section breaks as page break indicators
      const sections = (xml.match(/<w:sectPr/g) || []).length;
      return sections > 0 ? sections : null;
    } catch (e) {
      return null;
    }
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── STEP 1 — UPLOAD SCREEN ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function UploadScreen({ onNav, onFileReady }) {
  const [dragging,   setDragging]   = useState(false);
  const [file,       setFile]       = useState(null);
  const [pageCount,  setPageCount]  = useState(null);   // detected page count
  const [detecting,  setDetecting]  = useState(false);  // spinner while detecting
  const [err,        setErr]        = useState('');
  const fileRef = useRef();

  const validate = (f) => {
    if (!f) return 'No file selected';
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) return `File type not supported. Allowed: ${ALLOWED_EXT.join(', ')}`;
    if (f.size > MAX_MB * 1024 * 1024) return `File too large. Maximum is ${MAX_MB} MB`;
    return null;
  };

  const pick = async (f) => {
    setErr(''); setPageCount(null);
    const e = validate(f);
    if (e) { setErr(e); return; }
    setFile(f);
    // Auto-detect page count
    setDetecting(true);
    const count = await detectPageCount(f);
    setPageCount(count);
    setDetecting(false);
  };

  const onDrop = (e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files[0]); };
  const proceed = () => {
    if (!file) { setErr('Please select a document first'); return; }
    onFileReady(file, pageCount);
    onNav('newjob');
  };

  return (
    <div style={css.page}>
      <BackBtn onClick={() => onNav('home')}/>

      {/* Step breadcrumb */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:26, height:26, borderRadius:13, background:G.greenDark, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff' }}>1</div>
          <span style={{ fontSize:13, color:G.green, fontWeight:700 }}>Upload</span>
        </div>
        <div style={{ flex:1, height:1, background:G.border2 }}/>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:26, height:26, borderRadius:13, background:G.card2, border:`1px solid ${G.border2}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:G.text3 }}>2</div>
          <span style={{ fontSize:13, color:G.text3, fontWeight:600 }}>Preferences</span>
        </div>
      </div>

      <div style={css.pageTitle}>Upload document</div>

      {/* Drop zone */}
      <div
        onDragEnter={e => { e.preventDefault(); setDragging(true); }}
        onDragOver={e  => { e.preventDefault(); setDragging(true); }}
        onDragLeave={e => { e.preventDefault(); setDragging(false); }}
        onDrop={onDrop}
        onClick={() => !file && fileRef.current?.click()}
        style={{ border:`2px dashed ${dragging?G.green:file?G.greenBdr:G.border2}`, borderRadius:20,
          background:dragging?'#061A0E':file?'#081A10':G.card,
          padding:file?'24px':'48px 24px', textAlign:'center',
          cursor:file?'default':'pointer', marginBottom:12 }}>

        <input ref={fileRef} type="file" accept={ALLOWED_EXT.join(',')}
          style={{ display:'none' }} onChange={e => pick(e.target.files[0])}/>

        {!file ? (
          <>
            <div style={{ fontSize:56, marginBottom:16 }}>{dragging ? '📂' : '📁'}</div>
            <div style={{ fontSize:18, fontWeight:700, color:dragging?G.green:G.text, marginBottom:8 }}>
              {dragging ? 'Drop it here!' : 'Drag & drop your document'}
            </div>
            <div style={{ fontSize:13, color:G.text3, marginBottom:24 }}>or tap the button below to browse</div>
            <div style={{ display:'inline-flex', gap:6, flexWrap:'wrap', justifyContent:'center', marginBottom:12 }}>
              {['PDF','DOCX','DOC','JPG','PNG'].map(t => (
                <span key={t} style={{ background:G.card2, border:`1px solid ${G.border2}`, borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:700, color:G.text3 }}>{t}</span>
              ))}
            </div>
            <div style={{ fontSize:11, color:G.text3 }}>Max {MAX_MB} MB</div>
          </>
        ) : (
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            {/* Left: file info */}
            <div style={{ flex:1, textAlign:'left' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <span style={{ fontSize:32 }}>{getFileIcon(file.name)}</span>
                <div style={{ flex:1, overflow:'hidden' }}>
                  <div style={{ fontWeight:700, color:G.green, fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{file.name}</div>
                  <div style={{ fontSize:12, color:G.text3, marginTop:2 }}>{fmtSize(file.size)}</div>
                </div>
              </div>

              {/* Page count badge */}
              {detecting ? (
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:G.text3 }}>
                  <div style={{ width:12, height:12, border:`2px solid ${G.border}`, borderTop:`2px solid ${G.green}`, borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
                  Detecting page count…
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
              ) : pageCount !== null ? (
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:G.greenBg, border:`1px solid ${G.greenBdr}`, borderRadius:20, padding:'4px 12px' }}>
                  <span style={{ fontSize:14 }}>📑</span>
                  <span style={{ fontSize:13, fontWeight:700, color:G.green }}>{pageCount} page{pageCount !== 1 ? 's' : ''} detected</span>
                </div>
              ) : (
                <div style={{ fontSize:12, color:G.text3 }}>Page count unavailable for this format</div>
              )}

              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                <button onClick={e => { e.stopPropagation(); setFile(null); setPageCount(null); setErr(''); }}
                  style={{ background:G.redBg, border:`1px solid ${G.redBdr}`, color:G.red, borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                  ✕ Remove
                </button>
                <button onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                  style={{ background:G.card2, border:`1px solid ${G.border2}`, color:G.text2, borderRadius:8, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer' }}>
                  Change
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {!file && (
        <button style={{ ...css.btnGhost, marginBottom:12 }} onClick={() => fileRef.current?.click()}>
          📂 Browse files from device
        </button>
      )}

      <Alert msg={err}/>

      <div style={{ ...css.card2, marginTop:8, marginBottom:16 }}>
        <div style={{ fontSize:11, fontWeight:700, color:G.text3, textTransform:'uppercase', letterSpacing:0.8, marginBottom:12 }}>Supported file types</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[{fmt:'PDF',icon:'📕',note:'All versions — page count auto-detected'},{fmt:'DOCX / DOC',icon:'📘',note:'Word documents'},{fmt:'JPG / JPEG',icon:'🖼️',note:'Photos & scans — 1 page'},{fmt:'PNG',icon:'🖼️',note:'Images — 1 page'}].map(r => (
            <div key={r.fmt} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:18 }}>{r.icon}</span>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:G.text }}>{r.fmt}</div>
                <div style={{ fontSize:11, color:G.text3 }}>{r.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button style={{ ...css.btn, opacity:file?1:0.4 }} onClick={proceed} disabled={!file}>
        {file ? 'Continue to preferences →' : 'Select a file to continue'}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── PAGE SELECTOR ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function PageSelector({ onPagesChange, totalPages }) {
  const [mode,       setMode]       = useState('all');
  const [singlePage, setSinglePage] = useState('');
  const [rangeFrom,  setRangeFrom]  = useState('');
  const [rangeTo,    setRangeTo]    = useState('');
  const [customStr,  setCustomStr]  = useState('');
  const [parseErr,   setParseErr]   = useState('');
  const [selected,   setSelected]   = useState(new Set()); // for grid click-select

  const parseCustom = (str) => {
    if (!str.trim()) return { pages: [], err: 'Enter at least one page' };
    const parts = str.split(',').map(s => s.trim()).filter(Boolean);
    const pageSet = new Set();
    for (const part of parts) {
      if (/^\d+$/.test(part)) {
        const n = parseInt(part);
        if (n < 1) return { pages: [], err: `Page number must be ≥ 1 (got ${n})` };
        if (totalPages && n > totalPages) return { pages: [], err: `Page ${n} exceeds document length (${totalPages} pages)` };
        pageSet.add(n);
      } else if (/^\d+-\d+$/.test(part)) {
        const [a, b] = part.split('-').map(Number);
        if (a < 1) return { pages: [], err: 'Start of range must be ≥ 1' };
        if (b < a) return { pages: [], err: `End (${b}) must be ≥ start (${a})` };
        if (totalPages && b > totalPages) return { pages: [], err: `Page ${b} exceeds document length (${totalPages} pages)` };
        if (b - a > 999) return { pages: [], err: 'Range too large (max 1000 pages per range)' };
        for (let i = a; i <= b; i++) pageSet.add(i);
      } else {
        return { pages: [], err: `"${part}" is not valid — use numbers like 1,3 or ranges like 5-8` };
      }
    }
    return { pages: [...pageSet].sort((a, b) => a - b), err: null };
  };

  // When grid selection changes, sync to customStr
  const togglePage = (pg) => {
    const next = new Set(selected);
    next.has(pg) ? next.delete(pg) : next.add(pg);
    setSelected(next);
    const sorted = [...next].sort((a, b) => a - b);
    // Compress into ranges for the string
    if (sorted.length === 0) { setCustomStr(''); return; }
    const ranges = [];
    let start = sorted[0], end = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) { end = sorted[i]; }
      else { ranges.push(start === end ? `${start}` : `${start}-${end}`); start = end = sorted[i]; }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    setCustomStr(ranges.join(', '));
  };

  const selectAll  = () => { if (!totalPages) return; const s = new Set(Array.from({length:totalPages},(_,i)=>i+1)); setSelected(s); setCustomStr(`1-${totalPages}`); };
  const clearAll   = () => { setSelected(new Set()); setCustomStr(''); };
  const selectOdd  = () => { if (!totalPages) return; const s = new Set(Array.from({length:totalPages},(_,i)=>i+1).filter(p=>p%2!==0)); setSelected(s); setCustomStr([...s].sort((a,b)=>a-b).map(p=>`${p}`).join(', ')); };
  const selectEven = () => { if (!totalPages) return; const s = new Set(Array.from({length:totalPages},(_,i)=>i+1).filter(p=>p%2===0)); setSelected(s); setCustomStr([...s].sort((a,b)=>a-b).map(p=>`${p}`).join(', ')); };

  useEffect(() => {
    setParseErr('');
    if (mode === 'all')    { onPagesChange(totalPages || 1, 'all'); return; }
    if (mode === 'single') { const n = parseInt(singlePage); if (!singlePage||isNaN(n)||n<1){onPagesChange(0,'');return;} if(totalPages&&n>totalPages){setParseErr(`Page ${n} exceeds document (${totalPages} pages)`);onPagesChange(0,'');return;} onPagesChange(1, String(n)); return; }
    if (mode === 'range')  { const f=parseInt(rangeFrom),t=parseInt(rangeTo); if(!rangeFrom||!rangeTo||isNaN(f)||isNaN(t)){onPagesChange(0,'');return;} if(f<1){setParseErr('Start page must be ≥ 1');onPagesChange(0,'');return;} if(t<f){setParseErr(`End (${t}) must be ≥ start (${f})`);onPagesChange(0,'');return;} if(totalPages&&t>totalPages){setParseErr(`Page ${t} exceeds document (${totalPages} pages)`);onPagesChange(0,'');return;} onPagesChange(t-f+1,`${f}-${t}`); return; }
    if (mode === 'custom' || mode === 'grid') {
      const { pages, err } = parseCustom(customStr);
      if (err) { setParseErr(err); onPagesChange(0,''); return; }
      if (pages.length === 0) { onPagesChange(0,''); return; }
      onPagesChange(pages.length, pages.join(','));
    }
  // eslint-disable-next-line
  }, [mode, singlePage, rangeFrom, rangeTo, customStr, totalPages]);

  const inp = { ...css.input, fontSize:16, fontWeight:700 };

  const modes = [
    { id:'all',    label:'📄 All pages'   },
    { id:'single', label:'1️⃣ Single page'  },
    { id:'range',  label:'📑 Page range'   },
    { id:'custom', label:'✏️ Custom'       },
  ];

  return (
    <div>
      {/* Mode grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
        {modes.map(m => {
          const active = mode === m.id || (mode === 'grid' && m.id === 'custom');
          return (
            <button key={m.id} onClick={() => { setMode(m.id); setParseErr(''); }}
              style={{ padding:'10px 12px', borderRadius:8, border:`1.5px solid ${active?G.green:G.border2}`,
                background:active?G.greenBg:G.card2, color:active?G.green:G.text2,
                cursor:'pointer', fontWeight:600, fontSize:12, textAlign:'left' }}>
              {m.label}
            </button>
          );
        })}
      </div>

      {/* ── All pages ── */}
      {mode === 'all' && (
        <div style={{ fontSize:13, color:G.text3, lineHeight:1.6 }}>
          The entire document will be printed from first to last page.
          {totalPages && <span style={{ color:G.green, fontWeight:700 }}> ({totalPages} pages)</span>}
        </div>
      )}

      {/* ── Single page ── */}
      {mode === 'single' && (
        <div>
          <input style={inp} type="number" inputMode="numeric" min="1" max={totalPages||undefined}
            placeholder={totalPages ? `Enter page (1–${totalPages})` : 'Enter page number e.g. 5'}
            value={singlePage} onChange={e => setSinglePage(e.target.value.replace(/\D/g,''))}/>
          {singlePage && parseInt(singlePage) >= 1 && !parseErr && (
            <div style={{ fontSize:12, color:'#4ADE80', marginTop:6 }}>Printing page {singlePage} only</div>
          )}
        </div>
      )}

      {/* ── Range ── */}
      {mode === 'range' && (
        <div>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:G.text3, marginBottom:4 }}>From page</div>
              <input style={{ ...inp, boxSizing:'border-box' }} type="number" inputMode="numeric" min="1"
                placeholder="e.g. 3" value={rangeFrom} onChange={e => setRangeFrom(e.target.value.replace(/\D/g,''))}/>
            </div>
            <div style={{ fontSize:18, color:G.text3, marginTop:18 }}>→</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:G.text3, marginBottom:4 }}>To page</div>
              <input style={{ ...inp, boxSizing:'border-box' }} type="number" inputMode="numeric"
                min="1" max={totalPages||undefined}
                placeholder={totalPages ? `max ${totalPages}` : 'e.g. 10'}
                value={rangeTo} onChange={e => setRangeTo(e.target.value.replace(/\D/g,''))}/>
            </div>
          </div>
          {rangeFrom && rangeTo && parseInt(rangeTo) >= parseInt(rangeFrom) && !parseErr && (
            <div style={{ fontSize:12, color:'#4ADE80', marginTop:8 }}>
              Pages {rangeFrom}–{rangeTo} · {parseInt(rangeTo)-parseInt(rangeFrom)+1} pages total
            </div>
          )}
        </div>
      )}

      {/* ── Custom text input ── */}
      {mode === 'custom' && (
        <div>
          <input style={inp} placeholder="e.g. 1, 3, 5-8, 12"
            value={customStr} onChange={e => { setCustomStr(e.target.value); setSelected(new Set()); }}/>
          <div style={{ fontSize:11, color:G.text3, marginTop:6, lineHeight:1.7 }}>
            Enter pages and/or ranges separated by commas.<br/>
            <span style={{ color:G.text2 }}>Examples: </span>
            <span style={{ color:G.green, fontFamily:'monospace' }}>2, 5, 9</span>
            <span style={{ color:G.text3 }}> or </span>
            <span style={{ color:G.green, fontFamily:'monospace' }}>1-4, 7, 10-15</span>
          </div>
          {(() => {
            if (!customStr.trim()) return null;
            const { pages, err } = parseCustom(customStr);
            if (err || pages.length === 0) return null;
            return (
              <div style={{ background:G.greenBg, border:`1px solid ${G.greenBdr}`, borderRadius:8, padding:'8px 12px', marginTop:8, fontSize:12 }}>
                <span style={{ color:'#4ADE80', fontWeight:700 }}>{pages.length} page{pages.length>1?'s':''} selected: </span>
                <span style={{ color:G.green, fontFamily:'monospace' }}>
                  {pages.length <= 20 ? pages.join(', ') : pages.slice(0,20).join(', ') + ` … +${pages.length-20} more`}
                </span>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Page grid — shown whenever totalPages is known ─────────────── */}
      {totalPages && totalPages <= 200 && (mode === 'custom' || mode === 'range' || mode === 'single') && (
        <div style={{ marginTop:16 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
            <div style={{ fontSize:11, fontWeight:700, color:G.text3, textTransform:'uppercase', letterSpacing:0.8 }}>
              Or click pages below
            </div>
            {mode === 'custom' && (
              <div style={{ display:'flex', gap:6 }}>
                {[['All',selectAll],['Odd',selectOdd],['Even',selectEven],['Clear',clearAll]].map(([label,fn]) => (
                  <button key={label} onClick={fn}
                    style={{ background:G.card2, border:`1px solid ${G.border2}`, color:G.text3, borderRadius:6, padding:'3px 8px', fontSize:10, fontWeight:700, cursor:'pointer' }}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scrollable page grid */}
          <div style={{ maxHeight:180, overflowY:'auto', padding:'2px 0',
            scrollbarWidth:'thin', scrollbarColor:`${G.border2} transparent` }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(44px, 1fr))', gap:5 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => {
                // Determine if this page is "selected" based on current mode
                let isSelected = false;
                if (mode === 'single')  isSelected = parseInt(singlePage) === pg;
                if (mode === 'range')   isSelected = parseInt(rangeFrom) <= pg && pg <= parseInt(rangeTo);
                if (mode === 'custom')  isSelected = selected.has(pg) || (() => { const {pages} = parseCustom(customStr); return pages.includes(pg); })();

                return (
                  <button key={pg}
                    onClick={() => {
                      if (mode === 'single') { setSinglePage(String(pg)); }
                      else if (mode === 'range') {
                        if (!rangeFrom || (rangeFrom && rangeTo)) { setRangeFrom(String(pg)); setRangeTo(''); }
                        else { const f=parseInt(rangeFrom); if(pg>=f){setRangeTo(String(pg));}else{setRangeFrom(String(pg));setRangeTo(rangeFrom);} }
                      }
                      else if (mode === 'custom') { togglePage(pg); }
                    }}
                    style={{
                      height:36, borderRadius:6, border:`1.5px solid ${isSelected?G.green:G.border2}`,
                      background:isSelected?G.greenBg:G.card2,
                      color:isSelected?G.green:G.text3,
                      cursor:'pointer', fontWeight:700, fontSize:12,
                      transition:'all 0.1s',
                    }}>
                    {pg}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize:11, color:G.text3, marginTop:6 }}>
            {mode === 'single' ? 'Click a page to select it' :
             mode === 'range'  ? 'Click first page, then last page of range' :
             'Click pages to toggle selection'}
          </div>
        </div>
      )}

      {totalPages && totalPages > 200 && (mode === 'custom' || mode === 'range') && (
        <div style={{ fontSize:12, color:G.text3, marginTop:8 }}>
          ℹ Document has {totalPages} pages — type ranges manually above for best experience.
        </div>
      )}

      {/* Validation error */}
      {parseErr && <div style={{ ...css.err, marginTop:8, fontSize:12 }}>⚠ {parseErr}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── STEP 2 — NEW JOB PREFERENCES ─────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function NewJobScreen({ onNav, uploadedFile, totalPages }) {
  const [shops,          setShops]          = useState([]);
  const [shopId,         setShopId]         = useState('');
  const [colorMode,      setColorMode]      = useState('bw');
  const [paperSize,      setPaperSize]      = useState('A4');
  const [copies,         setCopies]         = useState(1);
  const [doubleSided,    setDoubleSided]    = useState(false);
  const [resolvedPages,  setResolvedPages]  = useState(totalPages || 1);
  const [pageDescriptor, setPageDescriptor] = useState('all');
  const [amount,         setAmount]         = useState(0);
  const [loading,        setLoading]        = useState(false);
  const [err,            setErr]            = useState('');

  const fileName = uploadedFile?.name || 'document.pdf';

  useEffect(() => {
    api.get('/shops/nearby/').then(r => setShops(r.data.shops || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const RATES = { bw:{A4:1.5,A3:2.25,Letter:1.5}, color:{A4:7,A3:10.5,Letter:7} };
    const rate  = (RATES[colorMode]||RATES.bw)[paperSize] || 1.5;
    const pages = resolvedPages > 0 ? resolvedPages : 1;
    setAmount(+(rate * pages * copies * (doubleSided ? 0.8 : 1)).toFixed(2));
  }, [resolvedPages, colorMode, paperSize, copies, doubleSided]);

  const handlePagesChange = useCallback((count, descriptor) => {
    setResolvedPages(count);
    setPageDescriptor(descriptor);
  }, []);

  const submit = async () => {
    if (!shopId)         { setErr('Please select a shop'); return; }
    if (!pageDescriptor) { setErr('Please complete the page selection'); return; }
    if (resolvedPages < 1) { setErr('Page selection is invalid — please check and try again'); return; }
    setLoading(true); setErr('');
    try {
      if (uploadedFile) {
        const fd = new FormData();
        fd.append('file',             uploadedFile);
        fd.append('shop_id',          shopId);
        fd.append('file_name',        fileName);
        fd.append('pages',            resolvedPages);
        fd.append('page_descriptor',  pageDescriptor);
        fd.append('color_mode',       colorMode);
        fd.append('paper_size',       paperSize);
        fd.append('copies',           copies);
        fd.append('double_sided',     doubleSided);
        await api.post('/jobs/create/', fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      } else {
        await api.post('/jobs/create/', {
          shop_id:shopId, file_name:fileName, pages:resolvedPages,
          page_descriptor:pageDescriptor, color_mode:colorMode,
          paper_size:paperSize, copies, double_sided:doubleSided,
        });
      }
      onNav('jobs');
    } catch(e) {
      setErr(e.response?.data?.error || 'Failed to create job');
    } finally { setLoading(false); }
  };

  const canSubmit = shopId && pageDescriptor && resolvedPages >= 1;

  return (
    <div style={css.page}>
      <BackBtn onClick={() => onNav('upload')}/>

      {/* Breadcrumb */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:26, height:26, borderRadius:13, background:G.greenBg, border:`1px solid ${G.greenBdr}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:G.green }}>✓</div>
          <span style={{ fontSize:13, color:G.green, fontWeight:600 }}>Upload</span>
        </div>
        <div style={{ flex:1, height:1, background:G.greenBdr }}/>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:26, height:26, borderRadius:13, background:G.greenDark, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff' }}>2</div>
          <span style={{ fontSize:13, color:G.text, fontWeight:700 }}>Preferences</span>
        </div>
      </div>

      <div style={css.pageTitle}>Print preferences</div>

      <div style={css.col}>

        {/* File banner with page count */}
        <div style={{ background:'#081A10', border:`1px solid ${G.greenBdr}`, borderRadius:12, padding:14, display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:26 }}>{getFileIcon(fileName)}</span>
          <div style={{ flex:1, overflow:'hidden' }}>
            <div style={{ fontWeight:600, color:G.green, fontSize:14, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{fileName}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:3, flexWrap:'wrap' }}>
              {uploadedFile && <span style={{ fontSize:11, color:'#4ADE80' }}>{fmtSize(uploadedFile.size)}</span>}
              {totalPages && (
                <>
                  <span style={{ fontSize:11, color:G.text3 }}>·</span>
                  <span style={{ fontSize:11, color:G.green, fontWeight:700 }}>📑 {totalPages} pages</span>
                </>
              )}
            </div>
          </div>
          <button style={{ background:'none', border:`1px solid ${G.border2}`, color:G.text3, cursor:'pointer', fontSize:11, padding:'5px 10px', borderRadius:6 }}
            onClick={() => onNav('upload')}>Change</button>
        </div>

        {/* Shop selection */}
        <div style={css.card}>
          <label style={css.label}>Print shop</label>
          {shops.length === 0 ? (
            <div style={{ color:G.text3, fontSize:13, padding:'8px 0' }}>No shops online right now</div>
          ) : shops.map(s => (
            <div key={s.id} onClick={() => setShopId(s.id)}
              style={{ background:shopId===s.id?G.greenBg:G.card2, border:`1.5px solid ${shopId===s.id?G.green:G.border2}`, borderRadius:10, padding:12, cursor:'pointer', marginBottom:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontWeight:700, color:G.text }}>{s.name}</div>
                <span style={{ ...css.badge, background:s.is_online?G.greenBg:'#1A1A1A', color:s.is_online?G.green:G.text3 }}>
                  {s.is_online ? '● Online' : '○ Offline'}
                </span>
              </div>
              <div style={{ fontSize:12, color:G.text3, marginTop:2 }}>{s.address}</div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:12 }}>
                <span style={{ color:s.queue_length>=18?G.red:s.queue_length>=14?G.amber:G.text3 }}>
                  Queue: {s.queue_length}/20 {s.queue_length>=20?'· Full 🔴':s.queue_length>=14?'· Busy 🟡':'· Free 🟢'}
                </span>
                <span style={{ color:G.text3 }}>⏰ {s.opens_at}–{s.closes_at}</span>
              </div>
              {shopId === s.id && <div style={{ fontSize:12, color:G.green, marginTop:6, fontWeight:600 }}>✓ Selected</div>}
            </div>
          ))}
        </div>

        {/* Print settings */}
        <div style={css.card}>
          <label style={css.label}>Print settings</label>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, color:G.text3, marginBottom:8 }}>Color mode</div>
            <div style={css.row}>
              <Chip val="bw"    cur={colorMode} onSet={setColorMode} label="⬛ Black & White"/>
              <Chip val="color" cur={colorMode} onSet={setColorMode} label="🎨 Color"/>
            </div>
          </div>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, color:G.text3, marginBottom:8 }}>Paper size</div>
            <div style={css.row}>
              {['A4','A3','Letter'].map(s => <Chip key={s} val={s} cur={paperSize} onSet={setPaperSize} label={s}/>)}
            </div>
          </div>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, color:G.text3, marginBottom:10 }}>Pages to print</div>
            <PageSelector onPagesChange={handlePagesChange} totalPages={totalPages}/>
          </div>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, color:G.text3, marginBottom:8 }}>Copies</div>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <button style={{ width:40, height:40, borderRadius:20, background:G.card2, border:`1px solid ${G.border2}`, color:G.text, cursor:'pointer', fontSize:22, display:'flex', alignItems:'center', justifyContent:'center' }}
                onClick={() => setCopies(c => Math.max(1, c-1))}>−</button>
              <span style={{ fontSize:22, fontWeight:800, color:G.text, minWidth:40, textAlign:'center' }}>{copies}</span>
              <button style={{ width:40, height:40, borderRadius:20, background:G.card2, border:`1px solid ${G.border2}`, color:G.text, cursor:'pointer', fontSize:22, display:'flex', alignItems:'center', justifyContent:'center' }}
                onClick={() => setCopies(c => Math.min(50, c+1))}>+</button>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:G.card2, padding:14, borderRadius:10 }}>
            <div>
              <div style={{ fontWeight:600, color:G.text, fontSize:14 }}>Double-sided</div>
              <div style={{ fontSize:12, color:G.text3 }}>Saves 20% on printing cost</div>
            </div>
            <div onClick={() => setDoubleSided(d => !d)}
              style={{ width:48, height:26, borderRadius:13, background:doubleSided?G.greenDark:G.card2, border:`1px solid ${doubleSided?G.green:G.border2}`, position:'relative', cursor:'pointer' }}>
              <div style={{ position:'absolute', top:3, left:doubleSided?22:3, width:20, height:20, borderRadius:10, background:'#fff', transition:'left 0.2s' }}/>
            </div>
          </div>
        </div>

        {/* Cost */}
        <div style={{ background:G.greenBg, border:`1px solid ${G.greenBdr}`, borderRadius:14, padding:20, textAlign:'center' }}>
          <div style={{ fontSize:12, color:'#4ADE80', marginBottom:4 }}>Estimated total</div>
          <div style={{ fontSize:42, fontWeight:900, color:G.green }}>₹{amount}</div>
          <div style={{ fontSize:12, color:'#4ADE80', marginTop:6 }}>
            {resolvedPages > 0 ? `${resolvedPages} page${resolvedPages>1?'s':''}` : (pageDescriptor==='all' ? `All${totalPages?` ${totalPages}`:''} pages` : 'Select pages above')}
            {resolvedPages > 0 && ` · ${copies} ${copies===1?'copy':'copies'} · ${colorMode==='color'?'Color':'B&W'}${doubleSided?' · duplex':''}`}
          </div>
        </div>

        <Alert msg={err}/>

        <button style={{ ...css.btn, opacity:loading||!canSubmit?0.5:1 }}
          onClick={submit} disabled={loading||!canSubmit}>
          {loading ? 'Creating job…' : 'Create job →'}
        </button>

      </div>
    </div>
  );
}


function ShopsScreen(){const[shops,setShops]=useState([]);const[loading,setLoading]=useState(true);useEffect(()=>{api.get('/shops/nearby/').then(r=>setShops(r.data.shops||[])).finally(()=>setLoading(false));},[]);return(<div style={css.page}><div style={css.pageTitle}>Shops near me</div>{loading?<Spinner/>:shops.length===0?(<div style={{textAlign:'center',padding:60,color:G.text3}}><div style={{fontSize:48}}>📍</div><div style={{fontSize:14,marginTop:12}}>No shops online right now</div></div>):shops.map(s=>(<div key={s.id}style={{...css.card,marginBottom:8}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}><div style={{fontWeight:700,color:G.text,fontSize:15}}>{s.name}</div><span style={{...css.badge,background:s.is_online?G.greenBg:'#1A1A1A',color:s.is_online?G.green:G.text3}}>{s.is_online?'● Online':'○ Offline'}</span></div><div style={{fontSize:13,color:G.text3,marginTop:4}}>{s.address}</div><div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:12,color:G.text3}}><span>⏰ {s.opens_at} – {s.closes_at}</span><span style={{color:s.queue_length>=20?G.red:s.queue_length>=14?G.amber:G.text3}}>Queue: {s.queue_length}/20</span></div></div>))}</div>);}

function PickupIDScreen({user,onBack}){return(<div style={css.page}><BackBtn onClick={onBack}/><div style={{fontSize:22,fontWeight:800,color:G.text,textAlign:'center',marginBottom:24}}>Show at the counter</div><div style={{background:G.greenBg,border:`1px solid ${G.greenBdr}`,borderRadius:20,padding:40,textAlign:'center',marginBottom:12}}><div style={{fontSize:13,color:'#4ADE80',marginBottom:12}}>YOUR PRINTSHOP ID</div><div style={{fontSize:72,fontWeight:900,color:G.green,letterSpacing:12}}>{user.short_id}</div><div style={{fontSize:15,color:'#4ADE80',marginTop:10}}>{user.name}</div></div><div style={{background:G.purpleBg,border:`1px solid ${G.purpleBdr}`,borderRadius:16,padding:24,textAlign:'center',marginBottom:20}}><div style={{fontSize:11,color:'#A78BFA',marginBottom:8}}>YOUR PICKUP CODE (say this to shopkeeper)</div><div style={{fontSize:48,fontWeight:900,color:G.purple,letterSpacing:10}}>{user.pickup_code}</div></div><div style={css.card}><div style={{fontSize:11,fontWeight:700,color:G.text3,textTransform:'uppercase',letterSpacing:0.8,marginBottom:14}}>How pickup works</div>{['Tell the shopkeeper your ID (e.g. A123)','They search and find your ready jobs','They ask: "What\'s your 6-digit code?"','Say your code — they type it in','Green light → collect your printout'].map((t,i)=>(<div key={i}style={{display:'flex',gap:10,marginBottom:12,alignItems:'flex-start'}}><div style={{width:22,height:22,borderRadius:11,background:G.greenBg,border:`1px solid ${G.greenBdr}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:G.green,flexShrink:0}}>{i+1}</div><div style={{fontSize:14,color:G.text2,lineHeight:1.5}}>{t}</div></div>))}</div></div>);}

function ProfileScreen({user,onLogout,onNav}){return(<div style={css.page}><div style={css.pageTitle}>Profile</div><div style={{...css.card,textAlign:'center',marginBottom:12}}><div style={{width:64,height:64,borderRadius:32,background:G.greenBg,border:`1px solid ${G.greenBdr}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:900,color:G.green,margin:'0 auto 12px'}}>{user.name[0].toUpperCase()}</div><div style={{fontSize:20,fontWeight:700,color:G.text}}>{user.name}</div><div style={{fontSize:14,color:G.text3,marginTop:4}}>{user.phone}</div><div style={{display:'inline-flex',gap:6,background:G.greenBg,border:`1px solid ${G.greenBdr}`,borderRadius:20,padding:'6px 16px',marginTop:10}}><span style={{fontSize:12,color:'#4ADE80'}}>ID</span><span style={{fontSize:16,fontWeight:900,color:G.green,letterSpacing:3}}>{user.short_id}</span></div></div>{[{icon:'🪪',title:'My ID card',sub:'Show at counter',action:()=>onNav('pickupid')},{icon:'📋',title:'Print history',sub:'All past jobs',action:()=>onNav('jobs')},{icon:'🚪',title:'Sign out',sub:'',action:onLogout,red:true}].map((item,i)=>(<div key={i}style={{...css.card,display:'flex',alignItems:'center',gap:14,marginBottom:8,cursor:'pointer',borderColor:item.red?'#2D0A0A':G.border}}onClick={item.action}><div style={{width:42,height:42,borderRadius:10,background:item.red?'#200A0A':G.card2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{item.icon}</div><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:item.red?G.red:G.text}}>{item.title}</div>{item.sub&&<div style={{fontSize:12,color:G.text3,marginTop:2}}>{item.sub}</div>}</div>{!item.red&&<span style={{color:G.text3}}>→</span>}</div>))}</div>);}

export default function App(){
  const[user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('user')||'null');}catch{return null;}});
  const[page,setPage]=useState('login');const[tab,setTab]=useState('home');const[uploadedFile,setUploadedFile]=useState(null);
  useEffect(()=>{if(localStorage.getItem('token')&&user)setPage('app');},[]);
  const handleLogin=(u)=>{setUser(u);setPage('app');setTab('home');};
  const handleLogout=()=>{localStorage.clear();setUser(null);setPage('login');};
  const navigate=useCallback((dest)=>setTab(dest),[]);
  const [totalPages,setTotalPages]=useState(null);
  const handleFileReady=useCallback((f,pc)=>{setUploadedFile(f);setTotalPages(pc);},[]);
  if(page==='login')return <div style={css.app}><LoginScreen onLogin={handleLogin}onGoRegister={()=>setPage('register')}/></div>;
  if(page==='register')return <div style={css.app}><RegisterScreen onLogin={handleLogin}onGoLogin={()=>setPage('login')}/></div>;
  const renderTab=()=>{if(tab==='upload')return<UploadScreen onNav={navigate}onFileReady={handleFileReady}/>;if(tab==='newjob')return<NewJobScreen onNav={navigate}uploadedFile={uploadedFile}totalPages={totalPages}/>;if(tab==='pickupid')return<PickupIDScreen user={user}onBack={()=>setTab('home')}/>;if(tab==='jobs')return<JobsScreen onNav={navigate}/>;if(tab==='shops')return<ShopsScreen/>;if(tab==='profile')return<ProfileScreen user={user}onLogout={handleLogout}onNav={navigate}/>;return<HomeScreen user={user}onNav={navigate}/>;};
  const mainTabs=['home','jobs','shops','profile'];
  return(<div style={css.app}><div style={css.nav}><div style={css.navBrand}>🖨️ PrintShop</div><div style={css.navRight}><div style={{fontSize:13,color:G.text3}}>{user.name.split(' ')[0]}</div><div style={{width:32,height:32,borderRadius:16,background:G.greenBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:G.green,cursor:'pointer'}}onClick={()=>navigate('profile')}>{user.name[0].toUpperCase()}</div></div></div>{renderTab()}{mainTabs.includes(tab)&&<TabBar active={tab}onNav={navigate}/>}</div>);
}


