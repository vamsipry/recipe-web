'use client'
import { useState } from 'react'
import Tesseract from 'tesseract.js'

export default function Scan(){
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [progress, setProgress] = useState(0)

  async function run(){
    if (!file) return
    const worker = await Tesseract.createWorker('eng')
    const { data } = await worker.recognize(file, {}, {
      progress: (p)=> setProgress(Math.round((p.progress||0)*100))
    })
    setText(data.text)
    await worker.terminate()
  }

  return <div>
    <h1>OCR Scan</h1>
    <input type='file' accept='image/*' onChange={e=>setFile(e.target.files[0])} />
    <button onClick={run} disabled={!file}>Recognize</button>
    {progress? <p>Progress: {progress}%</p>:null}
    <textarea rows={20} cols={80} value={text} onChange={e=>setText(e.target.value)} />
  </div>
}
