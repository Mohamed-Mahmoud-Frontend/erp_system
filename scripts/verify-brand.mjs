import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';
import {parse} from 'dotenv';
import {chromium,expect} from '@playwright/test';
const env=parse(await readFile('.env.local'));
const user={id:'10000000-0000-4000-8000-000000000099',aud:'authenticated',role:'authenticated',email:'design-preview@example.com',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()};
const token=[{alg:'HS256',typ:'JWT'},{sub:user.id,role:'authenticated',aud:'authenticated',exp:Math.floor(Date.now()/1000)+3600},'test'].map(x=>Buffer.from(typeof x==='string'?x:JSON.stringify(x)).toString('base64url')).join('.');
const api=createServer(async(req,res)=>{for await(const chunk of req){void chunk;}const path=new URL(req.url,'http://localhost').pathname;let data=[];if(path.startsWith('/auth/'))data=path.endsWith('/user')?user:{access_token:token,token_type:'bearer',expires_in:3600,refresh_token:'preview',user};if(path.includes('/user_access'))data=[{user_id:user.id,email:user.email,role:'admin',permissions:[],active:true}];if(path.includes('/delivery_notes'))data=[{id:'30000000-0000-4000-8000-000000000001',note_number:42,delivery_date:'2026-09-16',customer_name:'عميل تجريبي للمراجعة البصرية',recipient_name:'المستلم التجريبي',recipient_phone:'01000000000',delivery_address:'القاهرة · عنوان تجريبي',driver_name:'سائق تجريبي',vehicle_number:'أ ب ج ١٢٣',notes:'نسخة تجريبية لمراجعة التصميم والطباعة فقط',items:[{description:'خزان مياه سعة ١٠٠٠ لتر',quantity:3,unit:'قطعة'},{description:'وصلات تركيب',quantity:6,unit:'قطعة'}]}];if(req.headers.accept?.includes('vnd.pgrst.object')&&Array.isArray(data))data=data[0]??null;res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(data));});
await new Promise(r=>api.listen(3112,'127.0.0.1',r));
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3111'],{windowsHide:true,stdio:'pipe',env:{...process.env,NODE_OPTIONS:`--import=${pathToFileURL(resolve('scripts/batch5-fetch-isolation.mjs')).href}`,BATCH5_SUPABASE_ORIGIN:env.NEXT_PUBLIC_SUPABASE_URL,BATCH5_TEST_GATEWAY:'http://127.0.0.1:3112'}});
let browser;const errors=[];
try{for(let i=0;i<60;i++){try{if((await fetch('http://localhost:3111/login')).ok)break;}catch{}await delay(500);}
browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1050}});page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)?r.continue():r.abort());await mkdir('audit/brand',{recursive:true});
await page.goto('http://localhost:3111/login');await page.screenshot({path:'audit/brand/login-desktop.png',fullPage:true});await page.locator('#email').fill(user.email);await page.locator('#password').fill('preview-only');await page.locator('#login-submit').click();await page.waitForURL('**/dashboard');await expect(page.locator('h1')).toContainText('نظرة عامة');await expect(page.locator('.dashboard-home')).toBeVisible();await expect(page.locator('.workspace-loading')).toHaveCount(0);await page.screenshot({path:'audit/brand/dashboard-desktop.png',fullPage:true});
for(const width of [390,768,1440]){await page.setViewportSize({width,height:950});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Dashboard overflow at '+width);}
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'audit/brand/dashboard-mobile.png',fullPage:true});await page.getByRole('button',{name:'فتح القائمة'}).click();await expect(page.locator('#mobile-navigation')).toBeVisible();await page.locator('#mobile-navigation').getByRole('link',{name:'العملاء',exact:true}).click();await page.waitForURL('**/dashboard/clients');await expect(page.locator('#mobile-navigation')).not.toBeVisible();if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Clients mobile overflow');await page.screenshot({path:'audit/brand/clients-mobile.png',fullPage:true});await page.goto('http://localhost:3111/login');if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Login mobile overflow');await page.screenshot({path:'audit/brand/login-mobile.png',fullPage:true});
await page.setViewportSize({width:1440,height:1050});
await page.goto('http://localhost:3111/dashboard/delivery-notes/new');
await expect(page.locator('h1')).toContainText('إذن تسليم جديد');
await page.locator('input[name="customer_name"]').fill('شركة تجريبية');
await page.getByRole('button',{name:'+ إضافة صنف'}).click();
await expect(page.locator('textarea[required]')).toHaveCount(2);
await page.screenshot({path:'audit/brand/delivery-form-desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});
if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Delivery form mobile overflow');
await page.screenshot({path:'audit/brand/delivery-form-mobile.png',fullPage:true});
await page.setViewportSize({width:1280,height:1000});
await page.goto('http://localhost:3111/dashboard/delivery-notes/30000000-0000-4000-8000-000000000001');
await expect(page.locator('article')).toContainText('DN-000042');
await page.locator('article img').evaluate(img=>img.decode());
await page.emulateMedia({media:'print'});
await expect(page.locator('.erp-sidebar')).not.toBeVisible();
await expect(page.getByRole('button',{name:'طباعة / حفظ PDF'})).not.toBeVisible();
await expect(page.locator('article img')).toBeVisible();
await page.pdf({path:'audit/brand/delivery-note-preview.pdf',format:'A4',printBackground:true,preferCSSPageSize:true});
await page.screenshot({path:'audit/brand/delivery-note-print.png',fullPage:true});
await page.emulateMedia({media:'screen'});
await page.goto('http://localhost:3111/');
await expect(page.locator('body>header')).toBeVisible();
await expect(page.locator('body>footer')).toBeVisible();

if(errors.length)throw Error(errors.join('\n'));await writeFile('audit/brand/verification.json',JSON.stringify({passed:true,scope:'Isolated mock data, visual and navigation checks only; no live service verification',viewports:[390,768,1440],pageErrors:errors},null,2));console.log('PASS: desktop/mobile layout, overflow, mobile navigation, client table, no browser exceptions. Mock data only.');
}finally{await browser?.close();server.kill();await new Promise(r=>api.close(r));}