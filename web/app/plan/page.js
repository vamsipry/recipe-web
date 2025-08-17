'use client'
import { useEffect, useState } from 'react'

export default function Plan(){
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [items, setItems] = useState({})
  const [title, setTitle] = useState('')
  useEffect(()=>{ try{ setItems(JSON.parse(localStorage.getItem('plan')||'{}')) }catch{} },[])
  useEffect(()=>{ localStorage.setItem('plan', JSON.stringify(items)) },[items])
  const list = items[date] || []
  return <div>
    <h1>Meal Planner</h1>
    <input type='date' value={date} onChange={e=>setDate(e.target.value)} />
    <div>
      <input placeholder='Recipe title' value={title} onChange={e=>setTitle(e.target.value)} />
      <button onClick={()=>{ if(title.trim()){ const next=[...list, { id:Date.now(), title }]; setItems({...items, [date]: next}); setTitle('') } }}>Assign</button>
    </div>
    <ul>
      {list.map(i=> (<li key={i.id}>{i.title} <button onClick={()=>{ const next=list.filter(x=>x.id!==i.id); setItems({...items, [date]: next}) }}>✕</button></li>))}
    </ul>
  </div>
}
