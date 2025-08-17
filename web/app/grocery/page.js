'use client'
import { useEffect, useState } from 'react'

export default function Grocery(){
  const [items, setItems] = useState([])
  const [text, setText] = useState('')
  useEffect(()=>{ try{ setItems(JSON.parse(localStorage.getItem('grocery')||'[]')) }catch{} },[])
  useEffect(()=>{ localStorage.setItem('grocery', JSON.stringify(items)) },[items])
  return <div>
    <h1>Grocery List</h1>
    <input placeholder='Add item' value={text} onChange={e=>setText(e.target.value)} />
    <button onClick={()=>{ if(text.trim()){ setItems([{ id:Date.now(), title:text, done:false}, ...items]); setText('') } }}>Add</button>
    <ul>
      {items.map(i=> (
        <li key={i.id}>
          <input type='checkbox' checked={i.done} onChange={()=> setItems(items.map(x=> x.id===i.id?{...x, done:!x.done}:x)) }/>
          {i.title}
          <button onClick={()=> setItems(items.filter(x=>x.id!==i.id))}>✕</button>
        </li>
      ))}
    </ul>
  </div>
}
