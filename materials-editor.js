const STORAGE_KEY='life-archive-writing-studio-v1';
const STAGES=['靈感箱','發展中','可寫作','已放入章節'];
const TIME_PRECISIONS=['精確日期','年月','年份','約略時間','待確認'];
const nativeSetItem=Storage.prototype.setItem;

let materialState=[];
let deletedIds=new Set();
let rendering=false;
let saveTimer=null;
let searchTimer=null;
let searchComposing=false;
let viewMode=localStorage.getItem('life-archive