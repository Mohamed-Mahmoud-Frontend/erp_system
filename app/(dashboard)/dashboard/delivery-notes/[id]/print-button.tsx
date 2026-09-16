"use client";
export default function PrintButton() {
  return <button type="button" className="bg-blue-700 text-white px-5 py-2" onClick={async () => { await document.fonts.ready; window.print(); }}>طباعة / حفظ PDF</button>;
}
