import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MealForm from '../components/MealForm';
import { api } from '../lib/api';
export default function Share(){const [busy,setBusy]=useState(false);const navigate=useNavigate();async function submit(values){setBusy(true);try{await api('/meals',{method:'POST',body:JSON.stringify(values)});navigate('/listings',{state:{notice:'Your listing is live. Thanks for sharing!'}});}finally{setBusy(false);}}return <><section className="page-intro"><p className="eyebrow">PASS IT ON</p><h1>Share something <em>good.</em></h1><p className="muted">A little extra food can make someone’s day.</p></section><MealForm onSubmit={submit} busy={busy}/></>}
