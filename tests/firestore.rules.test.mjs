import fs from 'node:fs/promises';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const projectId='life-archive-rules-test';
const rules=await fs.readFile('firestore.rules','utf8');
const testEnv=await initializeTestEnvironment({
  projectId,
  firestore:{rules,host:'127.0.0.1',port:8080}
});

try{
  const alice=testEnv.authenticatedContext('alice').firestore();
  const bob=testEnv.authenticatedContext('bob').firestore();
  const guest=testEnv.unauthenticatedContext().firestore();

  const aliceTimeline=doc(alice,'users/alice/timeline/event-1');
  await assertSucceeds(setDoc(aliceTimeline,{identity:'private test'}));
  await assertSucceeds(getDoc(aliceTimeline));

  await assertFails(getDoc(doc(bob,'users/alice/timeline/event-1')));
  await assertFails(setDoc(doc(bob,'users/alice/timeline/event-2'),{identity:'blocked'}));

  await assertFails(getDoc(doc(guest,'users/alice/timeline/event-1')));
  await assertFails(setDoc(doc(guest,'users/alice/timeline/event-3'),{identity:'blocked'}));

  await assertFails(setDoc(doc(alice,'public/test'),{should:'fail'}));
  console.log('Firestore rules tests passed.');
}finally{
  await testEnv.cleanup();
}
