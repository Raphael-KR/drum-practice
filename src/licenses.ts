import notices from './third-party.generated.json';
/** Offline notices: never inject third-party license text as markup. */
export function licenseSection() {
  const section=document.createElement('details'); section.className='settings-group license-section';
  const heading=document.createElement('summary'); heading.textContent='오픈소스 라이선스'; section.append(heading);
  const intro=document.createElement('p'); intro.className='subtle';
  intro.textContent='사용한 라이브러리와 관련 자산의 저작권·라이선스 고지입니다. 내보낸 HTML에서도 오프라인으로 확인할 수 있습니다. JSZip은 MIT 라이선스를 선택해 사용합니다.'; section.append(intro);
  for(const entry of notices.entries){
    const details=document.createElement('details');
    const summary=document.createElement('summary'); summary.textContent=`${entry.name} ${entry.version} · ${entry.license}`; details.append(summary);
    if(entry.url){const link=document.createElement('a');link.href=entry.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='프로젝트 및 소스';details.append(link);}
    const pre=document.createElement('pre');pre.textContent=entry.text;details.append(pre);section.append(details);
  }
  const link=document.createElement('a');link.href='#';link.textContent='SoundTouchJS 0.3.0 비압축 코드 저장';link.download='soundtouch-0.3.0.js';
  link.onclick=e=>{e.preventDefault();const url=URL.createObjectURL(new Blob([notices.soundtouchSource],{type:'text/javascript'}));const a=document.createElement('a');a.href=url;a.download=link.download;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  section.append(link);return section;
}
