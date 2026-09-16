// Minimal PostgREST/Auth test boundary backed by REAL isolated PostgreSQL.
// SQL, constraints, RLS, triggers and calculations are from every migration.
// Authentication is a fixed TEST session; this is not an authentication test.
import {createServer} from 'node:http';
export async function gateway(db,port) {
 let fault=null;
 const user={id:'10000000-0000-4000-8000-000000000099',aud:'authenticated',role:'authenticated',email:'batch5-isolated@example.com',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()};
 const token=[{alg:'HS256',typ:'JWT'},{sub:user.id,role:'authenticated',aud:'authenticated',exp:Math.floor(Date.now()/1000)+3600},'test'].map(x=>Buffer.from(typeof x==='string'?x:JSON.stringify(x)).toString('base64url')).join('.');
 const identifier=s=>{if(!/^[a-z_]+$/.test(s))throw Error('Unsafe test identifier');return '"'+s+'"';};
 const server=createServer(async(req,res)=>{
  try {
   const url=new URL(req.url,'http://localhost'),parts=url.pathname.split('/').filter(Boolean);
   let body='';for await(const chunk of req)body+=chunk;
   body=body?JSON.parse(body):{};
   let result;
   if(url.pathname.startsWith('/auth/v1/')) {
    result=url.pathname.endsWith('/user') ? user : {access_token:token,token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:'isolated-refresh',user};
   } else if(parts[0]==='rest' && parts[1]==='v1') {
    const table=parts[2];
    if(fault===table) {res.writeHead(503,{'content-type':'application/json'});res.end(JSON.stringify({code:'TEST_SELECT_FAILURE',message:'Deliberate read failure',details:null,hint:null}));return;}
    await db.exec('SET ROLE authenticated');
    if(table==='rpc') {
     const name=identifier(parts[3]),keys=Object.keys(body);
     result=(await db.query(`SELECT ${name}(${keys.map((k,i)=>`${identifier(k)} => $${i+1}`).join(',')}) AS value`,Object.values(body))).rows[0].value;
    } else {
     const args=[],where=[];
     for(const [key,value] of url.searchParams) {
      if(['select','order','limit','offset'].includes(key))continue;
      const dot=value.indexOf('.'),op=value.slice(0,dot),v=value.slice(dot+1);
      const cmp={eq:'=',gte:'>=',lte:'<=',lt:'<',gt:'>'}[op];
      if(!cmp)throw Error('Unsupported test filter '+op);
      args.push(v);where.push(`${identifier(key)} ${cmp} $${args.length}`);
     }
     const filter=where.length?' WHERE '+where.join(' AND '):'';
     if(req.method==='PATCH') {
      const sets=Object.entries(body).map(([k,v])=>{args.push(v);return `${identifier(k)}=$${args.length}`;});
      result=(await db.query(`UPDATE ${identifier(table)} SET ${sets.join(',')} ${filter} RETURNING *`,args)).rows;
     } else if(req.method==='GET') {
      let order='';
      if(url.searchParams.has('order')) order=' ORDER BY '+url.searchParams.get('order').split(',').map(s=>{const [col,dir]=s.split('.');return identifier(col)+(dir==='desc'?' DESC':' ASC');}).join(',');
      result=(await db.query(`SELECT * FROM ${identifier(table)} ${filter}${order}`,args)).rows;
      const select=url.searchParams.get('select')??'*';
      // The invoice details query embeds exactly these two child collections.
      if(table==='invoices' && select.includes('sales_returns('))for(const row of result){row.payments=(await db.query('SELECT * FROM payments WHERE invoice_id=$1',[row.id])).rows;for(const p of row.payments)p.cheques=(await db.query('SELECT * FROM cheques WHERE payment_id=$1',[p.id])).rows;row.sales_returns=(await db.query('SELECT * FROM sales_returns WHERE invoice_id=$1',[row.id])).rows;}
     } else throw Error('Unsupported test method '+req.method);
     if(req.headers.accept?.includes('vnd.pgrst.object')) {
      if(result.length!==1){res.writeHead(406,{'content-type':'application/json'});res.end(JSON.stringify({code:'PGRST116',message:'Expected single row',details:`The result contains ${result.length} rows`}));return;}
      result=result[0];
     }
    }
   } else throw Error('Unexpected test endpoint');
   res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(result,(key,value)=>['work_date','week_start','week_end','due_date'].includes(key)&&typeof value==='string'?value.slice(0,10):value));
  } catch(error) {
   res.writeHead(400,{'content-type':'application/json'});res.end(JSON.stringify({code:error.code??'TEST_GATEWAY_ERROR',message:error.message,details:error.detail??null}));
  }
 });
 await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
 return {user,fault:table=>{fault=table;},close:()=>new Promise(resolve=>server.close(resolve))};
}
