"use client";
import {useActionState} from 'react';
import {signOutAction} from './actions';
export default function SignOutForm(){const[state,action,pending]=useActionState(signOutAction,undefined);return <form action={action}><button disabled={pending} className="border rounded px-3 py-1">تسجيل الخروج</button>{state?.message&&<p role="alert">{state.message}</p>}</form>;}
