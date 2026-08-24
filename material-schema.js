export const MATERIAL_SCHEMA_VERSION = 2;

export const MATERIAL_DEFAULTS = Object.freeze({
  title: '',
  time: '',
  timePrecision: '待確認',
  experienceCategory: '其他',
  tags: '',
  stage: '靈感箱',
  chapterId: '',
  timelineId: '',
  story: '',
  evidence: '',
  feelings: '',
  research: '',
  insight: '',
  source: ''
});

function uid(){
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : Date.now().toString(36)+Math.random().toString(36).slice(2);
}

function isV2(item){
  return Number(item?.schemaVersion || 0) >= MATERIAL_SCHEMA_VERSION;
}

function firstLegacyValue(...values){
  const nonEmpty = values.find(value => value !== undefined && value !== null && String(value) !== '');
  if(nonEmpty !== undefined) return nonEmpty;
  const defined = values.find(value => value !== undefined && value !== null);
  return defined ?? '';
}

function canonicalStory(item){
  return isV2(item)
    ? (item.story ?? '')
    : firstLegacyValue(item.story, item.story60, item.content, '');
}

function canonicalResearch(item){
  return isV2(item)
    ? (item.research ?? '')
    : firstLegacyValue(item.research, item.research15, '');
}

function canonicalInsight(item){
  return isV2(item)
    ? (item.insight ?? '')
    : firstLegacyValue(item.insight, item.insight25, item.reflection, '');
}

export function normalizeMaterial(input = {}){
  const item = input && typeof input === 'object' ? input : {};
  const story = String(canonicalStory(item) ?? '');
  const research = String(canonicalResearch(item) ?? '');
  const insight = String(canonicalInsight(item) ?? '');

  return {
    ...item,
    id: String(item.id || ''),
    title: String(item.title ?? MATERIAL_DEFAULTS.title),
    time: String(item.time ?? MATERIAL_DEFAULTS.time),
    timePrecision: String(item.timePrecision ?? MATERIAL_DEFAULTS.timePrecision),
    experienceCategory: String(item.experienceCategory ?? MATERIAL_DEFAULTS.experienceCategory),
    tags: String(item.tags ?? MATERIAL_DEFAULTS.tags),
    stage: String(item.stage ?? MATERIAL_DEFAULTS.stage),
    chapterId: String(item.chapterId ?? MATERIAL_DEFAULTS.chapterId),
    timelineId: String(item.timelineId ?? MATERIAL_DEFAULTS.timelineId),
    story,
    evidence: String(item.evidence ?? MATERIAL_DEFAULTS.evidence),
    feelings: String(item.feelings ?? MATERIAL_DEFAULTS.feelings),
    research,
    insight,
    source: String(item.source ?? MATERIAL_DEFAULTS.source),

    // Compatibility aliases. Existing UI can keep using these during the v2 migration.
    content: story,
    story60: story,
    research15: research,
    reflection: insight,
    insight25: insight,

    schemaVersion: MATERIAL_SCHEMA_VERSION
  };
}

export function createMaterial(input = {}){
  return normalizeMaterial({
    id: input.id || uid(),
    ...input,
    schemaVersion: MATERIAL_SCHEMA_VERSION
  });
}

export function setMaterialField(item, field, value){
  if(!item || typeof item !== 'object') return item;
  const next = value ?? '';

  if(['story','story60','content'].includes(field)){
    item.story = String(next);
    item.story60 = String(next);
    item.content = String(next);
  }else if(['research','research15'].includes(field)){
    item.research = String(next);
    item.research15 = String(next);
  }else if(['insight','insight25','reflection'].includes(field)){
    item.insight = String(next);
    item.insight25 = String(next);
    item.reflection = String(next);
  }else{
    item[field] = next;
  }

  item.schemaVersion = MATERIAL_SCHEMA_VERSION;
  return item;
}

export function toFirestoreMaterial(input = {}, {order} = {}){
  const normalized = normalizeMaterial(input);
  const {updatedAt, migratedAt, ...clean} = normalized;
  if(order !== undefined) clean.order = order;
  return clean;
}

export function fromFirestoreMaterial(data = {}, id = ''){
  return normalizeMaterial({
    ...data,
    id: id || data.id || ''
  });
}

export function migrateMaterialList(items = []){
  return Array.isArray(items) ? items.map(normalizeMaterial) : [];
}

export const LifeArchiveMaterialSchema = Object.freeze({
  version: MATERIAL_SCHEMA_VERSION,
  defaults: MATERIAL_DEFAULTS,
  normalizeMaterial,
  createMaterial,
  setMaterialField,
  toFirestoreMaterial,
  fromFirestoreMaterial,
  migrateMaterialList
});

if(typeof window !== 'undefined'){
  window.LifeArchiveMaterialSchema = LifeArchiveMaterialSchema;
}
