// fixtures/user.fixture.ts
import rawUsers from '../utils/users.json';
import type { TestInfo } from '@playwright/test';

type User = {
  phone: string;
  idcard: string;
};

const users = rawUsers as Record<string, User>;

export const usersFixture = {
  user: async (
    {},
    use: any,
    testInfo: TestInfo   // ✅ ใส่ type ตรงนี้
  ) => {
    const match = testInfo.title.match(/@user\s+(\w+)/);

    if (!match) {
      throw new Error('❌ ต้องใส่ @user <key> ในชื่อ test');
    }

    const userKey = match[1];
    console.log(`🔍 กำลังใช้ user key: ${userKey}`);
    const selectedUser = users[userKey];

    if (!selectedUser) {
      throw new Error(`❌ ไม่พบ user '${userKey}' ใน users.json`);
    }

    await use(selectedUser);
  }
};
