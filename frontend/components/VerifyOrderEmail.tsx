'use client';
import { useState } from 'react';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
export default function VerifyOrderEmail() {
 const {user,login}=useAuthStore();
 const [otp,setOtp]=useState(''),[sent,setSent]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 if(!user || user.emailVerified) return null;
 async function act(verify:boolean) {
  setBusy(true);
  try {
   const {data}=await api.post(verify?'/auth/verify-email':'/auth/send-email-verification',verify?{otp}:{});
   if(verify){login(data.user,data.token);window.location.reload();}
   else {setSent(true);setMessage('Code sent. Check your inbox. Resends are limited to once per minute.');}
  } catch(e:any){setMessage(e.response?.data?.message || 'Please try again.');}
  finally{setBusy(false);}
 }
 return <section className="bubble-card p-6 mb-6"><h2 className="font-bold">Find your earlier guest orders</h2><p className="my-3 text-sm">Verify {user.email} to link guest orders placed with this email.</p>
 <button disabled={busy} className="bubble-btn" onClick={()=>act(false)}>{busy?'Please wait…':sent?'Resend code':'Send email verification code'}</button>
 {sent && <form className="mt-3 flex flex-wrap gap-3" onSubmit={e=>{e.preventDefault();act(true);}}><label htmlFor="email-otp">Email code</label><input id="email-otp" className="bubble-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={e=>setOtp(e.target.value)} /><button className="bubble-btn" disabled={busy}>Verify & link orders</button></form>}
 <p role="status" className="text-sm mt-3">{message}</p></section>;
}
