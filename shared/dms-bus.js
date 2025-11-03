// DMS-BUS: passaggio dati tra editor (IndexedDB + fallback localStorage)
window.DMSBUS = (function(){
  const DBNAME='dms-bus', STORE='kv';
  let db=null;
  function openDB(){
    return new Promise((res,rej)=>{
      if(db) return res(db);
      const r=indexedDB.open(DBNAME,1);
      r.onupgradeneeded=()=>r.result.createObjectStore(STORE);
      r.onsuccess=()=>{db=r.result; res(db);};
      r.onerror=()=>rej(r.error);
    });
  }
  async function put(key, val){
    try{
      const d=await openDB(); return new Promise((res,rej)=>{
        const tx=d.transaction(STORE,'readwrite'); tx.objectStore(STORE).put(val,key);
        tx.oncomplete=()=>res(); tx.onerror=()=>rej(tx.error);
      });
    }catch{ localStorage.setItem(key, typeof val==='string'?val:JSON.stringify(val)); }
  }
  async function get(key){
    try{
      const d=await openDB(); return new Promise((res,rej)=>{
        const tx=d.transaction(STORE,'readonly'); const req=tx.objectStore(STORE).get(key);
        req.onsuccess=()=>res(req.result||null); req.onerror=()=>rej(req.error);
      });
    }catch{
      const v=localStorage.getItem(key); try{return JSON.parse(v);}catch{return v;}
    }
  }
  async function putBlob(key, blob){ return put(key, blob); }
  async function getBlob(key){ return get(key); }
  async function putJSON(key, obj){ return put(key, JSON.stringify(obj)); }
  async function getJSON(key){ const v=await get(key); return v?JSON.parse(v):null; }
  async function deleteKey(key){
    try{
      const d=await openDB(); return new Promise((res,rej)=>{
        const tx=d.transaction(STORE,'readwrite'); tx.objectStore(STORE).delete(key);
        tx.oncomplete=()=>res(); tx.onerror=()=>rej(tx.error);
      });
    }catch{ localStorage.removeItem(key); }
  }
  async function clear(){ try{const d=await openDB(); d.close(); indexedDB.deleteDatabase(DBNAME);}catch{} localStorage.clear(); }
  return { putBlob,getBlob, putJSON,getJSON, deleteKey, clear, get };
})();

