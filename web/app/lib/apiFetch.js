'use client'
import { getSession } from 'next-auth/react'

export async function apiFetch(path, options={}) {
  const session = await getSession()
  const token = session?.idToken || session?.id_token || session?.accessToken
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}${path}`, { ...options, headers })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
