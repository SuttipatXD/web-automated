import rawUsers from '../utils/users.json';
import { randomThaiPhone, randomThaiIdCard } from '../utils/random';
import type { TestInfo } from '@playwright/test';

type User = {
  phone: string;
  idcard: string;
};

const users = rawUsers as Record<string, User>;

export const usersFixture = {
  user: async ({}, use: any, testInfo: TestInfo) => {
    const match = testInfo.title.match(/@user\s+(\w+)/);

    if (!match) {
      throw new Error('❌ ต้องใส่ @user <key> ในชื่อ test');
    }

    const userKey = match[1];
    const raw = users[userKey];

    if (!raw) {
      throw new Error(`❌ ไม่พบ user '${userKey}' ใน users.json`);
    }

    const selectedUser: User = {
      phone: raw.phone === 'random' ? randomThaiPhone() : raw.phone,
      idcard: raw.idcard === 'random' ? randomThaiIdCard() : raw.idcard,
    };

    await testInfo.attach('user', {
      body: `user key: ${userKey} | phone: ${selectedUser.phone} | idcard: ${selectedUser.idcard}`,
      contentType: 'text/plain',
    });
    await use(selectedUser);
  },
};
