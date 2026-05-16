# web-automated

โปรเจค Automated Testing สำหรับเว็บแอปพลิเคชัน **BeWallet** โดยใช้ [Playwright](https://playwright.dev/) และ TypeScript ตาม Pattern **Page Object Model (POM)**

---

## โครงสร้างโปรเจค

```
web-automated/
├── fixtures/
│   ├── base.fixture.ts       # extend Playwright test — ตั้ง viewport Full HD + ปิด animation
│   └── user.fixture.ts       # โหลด user จาก users.json ตาม @user <key> ในชื่อ test
├── pages/
│   ├── main.page.ts          # หน้าหลัก — เปิดหน้า Register / KYC
│   ├── login.page.ts         # หน้า Login — กรอกเบอร์โทรศัพท์ + เลขบัตรประชาชน
│   ├── otp.page.ts           # หน้า OTP — กรอกและยืนยัน OTP
│   └── result.page.ts        # หน้าผลลัพธ์ — Success / Waiting / Not Found
├── test/
│   ├── kyc_success_status.spec.ts    # Test: KYC สำเร็จ (userA)
│   ├── kyc_waiting_status.spec.ts    # Test: KYC รอตรวจสอบ (userC)
│   └── kyc_user_not_found.spec.ts    # Test: ไม่พบข้อมูลผู้ใช้ (userB)
├── utils/
│   └── users.json            # ข้อมูล user สำหรับ test (ถูก .gitignore)
├── .env                      # Environment variables (BASE_URL)
└── playwright.config.ts      # Playwright configuration
```

---

## ความต้องการเบื้องต้น

- Node.js >= 18
- npm
- Firefox browser (Playwright จะติดตั้งให้อัตโนมัติ)

---

## การติดตั้ง

```bash
npm install
npx playwright install firefox
```

---

## การตั้งค่า Environment

สร้างไฟล์ `.env` ที่ root ของโปรเจค:

```env
BASE_URL=https://your-app-url.com
```

---

## ข้อมูล User สำหรับ Test

สร้างไฟล์ `utils/users.json` (ไม่ถูก commit เข้า git) โดยมีโครงสร้างดังนี้:

```json
{
  "<key>": {
    "phone": "<หมายเลขโทรศัพท์>",
    "idcard": "<หมายเลขบัตรประชาชน>"
  }
}
```

| Key   | Flow              | คำอธิบาย                          |
|-------|-------------------|-----------------------------------|
| userA | KYC Success       | ผ่านการยืนยันตัวตนสำเร็จ          |
| userB | User Not Found    | ไม่พบข้อมูลในระบบ                 |
| userC | KYC Waiting       | อยู่ระหว่างรอตรวจสอบ              |

---

## การรัน Test

```bash
# รัน test ทั้งหมด
npx playwright test

# รัน test เฉพาะไฟล์
npx playwright test test/kyc_success_status.spec.ts

# รันพร้อมดู browser (headed mode)
npx playwright test --headed

# ดู HTML report หลังรัน test
npx playwright show-report
```

---

## Test Cases

### 1. KYC Success Flow
**ไฟล์:** `test/kyc_success_status.spec.ts`

ขั้นตอน: เปิดหน้าหลัก → ไปหน้า KYC → Login (phone + idcard) → กรอก OTP → แสดงผล **"สมัคร BeWallet สำเร็จ"** → กลับหน้าแรก

### 2. KYC Waiting Flow
**ไฟล์:** `test/kyc_waiting_status.spec.ts`

ขั้นตอน: เปิดหน้าหลัก → ไปหน้า KYC → Login → กรอก OTP → แสดงผล **"กำลังตรวจสอบการยืนยันตัวตน"** → กลับหน้าแรก

### 3. User Not Found Flow
**ไฟล์:** `test/kyc_user_not_found.spec.ts`

ขั้นตอน: เปิดหน้าหลัก → ไปหน้า KYC → Login → แสดงผล **"ไม่สามารถทำรายการได้ สอบถามรายละเอียดเพิ่มเติม โทร.1220"**

---

## User Fixture

Test แต่ละตัวกำหนด user ผ่าน `@user <key>` ในชื่อ test:

```typescript
test('@user userA KYC Success flow', async ({ page, user }) => {
  // user.phone และ user.idcard ถูก inject อัตโนมัติจาก users.json
});
```

Fixture จะอ่านชื่อ test, แยก key หลัง `@user`, และโหลดข้อมูลจาก `utils/users.json`

---

## Configuration หลัก

| ค่า            | รายละเอียด                              |
|----------------|-----------------------------------------|
| Browser        | Firefox                                 |
| Viewport       | 1920 × 1080                             |
| Animation      | ปิดทั้งหมด (ลด flaky)                   |
| Parallel       | เปิด (fullyParallel: true)              |
| Retry (CI)     | 2 ครั้ง                                 |
| Reporter       | HTML (`playwright-report/index.html`)   |
| Base URL       | กำหนดจาก `.env` → `BASE_URL`           |
