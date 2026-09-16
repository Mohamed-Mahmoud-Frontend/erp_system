// Template only. Generate the private installation copy with npm run sync:setup.
// Deploy as a Web app, execute as yourself. HMAC authentication is mandatory.
const ERP_SECRET = '__ERP_SECRET__';
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const request = JSON.parse(e.postData.contents);
    if (!/^[0-9]+$/.test(String(request.ts)) || Math.abs(Date.now()-Number(request.ts))>300000 || !/^[a-f0-9-]{36}$/.test(request.nonce)) throw Error('Authentication failed');
    const signed = request.ts+'.'+request.nonce+'.'+request.payload;
    const expected = Utilities.computeHmacSha256Signature(signed,ERP_SECRET).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');
    let difference=expected.length^String(request.signature).length;
    for(let i=0;i<expected.length;i++)difference|=expected.charCodeAt(i)^(String(request.signature).charCodeAt(i)||0);
    if(difference || ERP_SECRET==='__ERP_SECRET__')throw Error('Authentication failed');
    lock.waitLock(20000);
    const cache=CacheService.getScriptCache();if(cache.get(request.nonce))throw Error('Repeated request');cache.put(request.nonce,'1',600);
    const payload=JSON.parse(Utilities.newBlob(Utilities.base64Decode(request.payload)).getDataAsString('UTF-8'));
    const props=PropertiesService.getScriptProperties();
    let folderId=props.getProperty('folder');
    if(!folderId){const folders=DriveApp.getFoldersByName('نسخ نظام المصنع');folderId=folders.hasNext()?folders.next().getId():DriveApp.createFolder('نسخ نظام المصنع').getId();props.setProperty('folder',folderId);}
    const folder=DriveApp.getFolderById(folderId);let result;
    if(payload.kind==='backup'){
      if(!/^erp-[a-zA-Z0-9.-]+\.dump\.enc$/.test(payload.name))throw Error('Invalid backup name');
      const bytes=Utilities.base64Decode(payload.data);const hash=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,bytes).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');
      if(hash!==payload.sha256)throw Error('Backup checksum mismatch');
      const existing=folder.getFilesByName(payload.name);const file=existing.hasNext()?existing.next():folder.createFile(Utilities.newBlob(bytes,'application/octet-stream',payload.name));
      const storedHash=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,file.getBlob().getBytes()).map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');
      if(storedHash!==hash)throw Error('Stored backup differs');
      result={name:payload.name,sha256:hash,file_id:file.getId()};
    }else if(payload.kind==='sheet'){
      const tables=['clients','orders','invoices','payments','cheques','sales_returns','materials','material_movements','product_specs','product_spec_materials','suppliers','supplier_transactions','workers','attendance','worker_transactions','worker_payouts','quotations','invoice_sequences'];
      if(!tables.includes(payload.table)||!Array.isArray(payload.columns)||!Array.isArray(payload.rows))throw Error('Invalid table');
      const previous=props.getProperty('version_'+payload.table);
      if(previous && new Date(previous)>new Date(payload.snapshot_at))throw Error('Stale snapshot; retry with current data');
      let fileId=props.getProperty('file_'+payload.table);
      if(!fileId){const existing=folder.getFilesByName('ERP - '+payload.table);if(existing.hasNext())fileId=existing.next().getId();else {const created=SpreadsheetApp.create('ERP - '+payload.table);fileId=created.getId();DriveApp.getFileById(fileId).moveTo(folder);}props.setProperty('file_'+payload.table,fileId);}
      const book=SpreadsheetApp.openById(fileId),name='snapshot_'+request.nonce.slice(0,8),sheet=book.insertSheet(name);
      // Strings are escaped, so client names cannot inject spreadsheet formulas.
      const cell=v=>v==null?'':typeof v==='number'||typeof v==='boolean'?v:"'"+(typeof v==='object'?JSON.stringify(v):String(v));
      const values=[payload.columns,...payload.rows.map(row=>payload.columns.map(c=>cell(row[c])))];
      if(sheet.getMaxRows()<values.length)sheet.insertRowsAfter(sheet.getMaxRows(),values.length-sheet.getMaxRows());
      if(sheet.getMaxColumns()<payload.columns.length)sheet.insertColumnsAfter(sheet.getMaxColumns(),payload.columns.length-sheet.getMaxColumns());
      sheet.getRange(1,1,values.length,payload.columns.length).setValues(values);sheet.setFrozenRows(1);SpreadsheetApp.flush();
      const old=book.getSheetByName('الحالة الحالية');if(old)book.deleteSheet(old);sheet.setName('الحالة الحالية');
      book.getSheets().filter(s=>s.getSheetId()!==sheet.getSheetId()).forEach(s=>book.deleteSheet(s));
      props.setProperty('version_'+payload.table,payload.snapshot_at);
      result={table:payload.table,row_count:payload.rows.length,snapshot_at:payload.snapshot_at,file_id:fileId};
    }else throw Error('Unknown operation');
    return ContentService.createTextOutput(JSON.stringify({ok:true,...result})).setMimeType(ContentService.MimeType.JSON);
  }catch(error){return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(error.message)})).setMimeType(ContentService.MimeType.JSON);}
  finally {if(lock.hasLock())lock.releaseLock();}
}
