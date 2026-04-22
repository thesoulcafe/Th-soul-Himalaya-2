import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import * as fs from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'soul-himalaya-test',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Firestore Security Rules', () => {

  test('prevents self-promotion to admin', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@gmail.com', email_verified: true });
    await assertFails(setDoc(alice.firestore('soul-himalaya-test').doc('users/alice'), {
      uid: 'alice',
      email: 'alice@gmail.com',
      role: 'admin' // Attempting self-promotion
    }));
  });

  test('prevents fake timestamps', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@gmail.com', email_verified: true });
    // This is hard to test directly without a complex mock, 
    // but the rule enforces `data.createdAt == request.time`
    await assertFails(setDoc(alice.firestore('soul-himalaya-test').doc('bookings/b1'), {
      userId: 'alice',
      userName: 'Alice',
      userEmail: 'alice@gmail.com',
      status: 'pending',
      totalPrice: 100,
      createdAt: new Date('2020-01-01') // Fake timestamp
    }));
  });

  test('prevents soul point injection', async () => {
    const alice = testEnv.authenticatedContext('alice', { email: 'alice@gmail.com', email_verified: true });
    // Setup initial profile
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(context.firestore('soul-himalaya-test').doc('users/alice'), {
        uid: 'alice',
        email: 'alice@gmail.com',
        role: 'user',
        soulPoints: 0
      });
    });

    const aliceDoc = alice.firestore('soul-himalaya-test').doc('users/alice');
    await assertFails(updateDoc(aliceDoc, {
      soulPoints: 1000 // Attempting point injection
    }));
  });
});
