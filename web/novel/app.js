import {loadPageData,renderAssessmentMeta} from './page-data.js?v=20261107-platform-score-2';
try{
 const data=await loadPageData();renderAssessmentMeta(data.snapshot,data.scored);
 if(document.querySelector('#library')){const {renderLibraryPage}=await import('./library-page.js?v=independent-synopsis');renderLibraryPage(data);}
 if(document.querySelector('#batch')){const {renderRecords}=await import('./records-page.js?v=20261109-listed-0-1?v=20261107-platform-score-2');renderRecords(data);}
}catch(error){document.querySelector('#load-error').textContent='数据暂时未能加载，请刷新重试。';console.error(error);}
