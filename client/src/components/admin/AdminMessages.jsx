import { useState, useEffect } from 'react'
import { getMessages, deleteMessage, markRead } from '../../api'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await getMessages()
      setMessages(res.data.data)
    } catch(e) {}
  }

  const handleDelete = async (id) => {
    if(!confirm("Delete this message?")) return
    try {
      await deleteMessage(id)
      load()
    } catch(e) {}
  }

  const handleMarkRead = async (id) => {
    try {
      await markRead(id)
      load()
    } catch(e) {}
  }

  return (
    <div className="admin-section">
      <h3 style={{ marginBottom: '24px', fontSize: '18px', color: 'var(--white)' }}>Inbox</h3>

      <div className="admin-list" style={{ gap: '20px' }}>
        {messages.map(m => (
           <div key={m.id} style={{ padding: '24px', background: m.read ? 'var(--surface)' : 'rgba(124,58,237,0.1)', border: '1px solid var(--border)', borderRadius: '12px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                     <div style={{ fontSize: '16px', color: 'var(--white)', fontWeight: 600 }}>{m.name}</div>
                     <div style={{ fontSize: '13px', color: 'var(--accent2)', marginTop: '4px' }}>{m.email}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--dim)' }}>{new Date(m.time).toLocaleString()}</div>
               </div>
               
               <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--cyan)', marginBottom: '12px', fontFamily: 'Space Mono, monospace' }}>
                  Service: {m.service}
               </div>

               <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                  {m.message}
               </div>

               <div style={{ display: 'flex', gap: '12px' }}>
                  {!m.read && <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => handleMarkRead(m.id)}>Mark as Read</button>}
                  <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '12px', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }} onClick={() => handleDelete(m.id)}>Delete</button>
               </div>
           </div>
        ))}
        {messages.length === 0 && <div style={{ color: 'var(--dim)', fontSize: '14px' }}>No messages yet.</div>}
      </div>
    </div>
  )
}
