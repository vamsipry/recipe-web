'use client'
import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/apiFetch'

export default function Recipes(){
  const [recipes, setRecipes] = useState([])
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({ title:'', sourceURL:'', ingredients:'', steps:'', tags:'', imageKey:'' })

  async function load(){ setRecipes(await apiFetch('/recipes')) }
  useEffect(()=>{ load().catch(console.error) },[])

  async function create(){
    const body = {
      title: form.title,
      sourceURL: form.sourceURL,
      ingredients: form.ingredients.split('\n').filter(Boolean),
      steps: form.steps.split('\n').filter(Boolean),
      tags: form.tags.split(',').map(s=>s.trim()).filter(Boolean),
      imageKey: form.imageKey || null
    }
    await apiFetch('/recipes', { method:'POST', body: JSON.stringify(body) })
    setForm({ title:'', sourceURL:'', ingredients:'', steps:'', tags:'', imageKey:'' })
    await load()
  }

  const filtered = recipes.filter(r=> r.title.toLowerCase().includes(filter.toLowerCase()) || (r.tags||[]).some(t=>t.toLowerCase().includes(filter.toLowerCase())))

  return <div>
    <h1>Recipes</h1>
    <div style={{display:'flex', gap:12, flexWrap:'wrap'}}>
      <input placeholder='Search' value={filter} onChange={e=>setFilter(e.target.value)} />
      <input placeholder='Title' value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
      <input placeholder='Source URL' value={form.sourceURL} onChange={e=>setForm({...form, sourceURL:e.target.value})} />
      <input placeholder='Tags (comma separated)' value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})} />
      <UploadImage onUploaded={(key)=>setForm({...form, imageKey:key})} />
    </div>
    <div style={{display:'flex', gap:8, marginTop:8}}>
      <textarea placeholder='Ingredients (one per line)' value={form.ingredients} onChange={e=>setForm({...form, ingredients:e.target.value})} rows={6} cols={40} />
      <textarea placeholder='Steps (one per line)' value={form.steps} onChange={e=>setForm({...form, steps:e.target.value})} rows={6} cols={40} />
    </div>
    <button onClick={create}>Save</button>
    <ImportFromUrl onImported={async (r)=>{ setForm({ title:r.title, sourceURL:'', ingredients:r.ingredients.join('\n'), steps:r.steps.join('\n'), tags:r.tags.join(', '), imageKey:'' }) }} />

    <ul>
      {filtered.map(r=> (
        <li key={r.id}><b>{r.title}</b> {r.tags?.length?`#${r.tags.join(' #')}`:''}</li>
      ))}
    </ul>
  </div>
}

function ImportFromUrl({ onImported }){
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  async function go(){
    setLoading(true)
    try{
      const data = await apiFetch('/recipes/import', { method:'POST', body: JSON.stringify({ url }) })
      onImported?.(data)
    } finally{ setLoading(false) }
  }
  return <div style={{marginTop:16}}>
    <input placeholder='Paste recipe URL' value={url} onChange={e=>setUrl(e.target.value)} style={{width:400}} />
    <button onClick={go} disabled={!url || loading}>{loading?'Importing…':'Import'}</button>
  </div>
}

function UploadImage({ onUploaded }){
  const [file, setFile] = useState(null)
  async function upload(){
    if (!file) return
    const { uploadUrl, key } = await apiFetch('/images/upload-url', { method:'POST', body: JSON.stringify({ contentType: file.type }) })
    await fetch(uploadUrl, { method:'PUT', headers: { 'Content-Type': file.type }, body: file })
    onUploaded?.(key)
  }
  return <div>
    <input type='file' accept='image/*' onChange={e=>setFile(e.target.files[0])} />
    <button onClick={upload} disabled={!file}>Upload</button>
  </div>
}
