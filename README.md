# web-automated

โปรเจค Automated Testing สำหรับเว็บแอปพลิเคชัน **BeWallet** โดยใช้ [Playwright](https://playwright.dev/) และ TypeScript ตาม Pattern **Page Object Model (POM)**

---

## โครงสร้างโปรเจค

```
web-automated/
├── fixtures/
│   ├── base.fixture.ts       # extend Playwright test — ตั้ง viewport Full HD + ปิด animation
│   └── user.fixture.ts       # โหลด user จาก users.json ตาม @user <key> ในชื่อ test
│                             # รองรับ "random" เพื่อสุ่มเบอร์/เลขบัตรอัตโนมัติ
├── pages/
│   ├── main.page.ts          # หน้าหลัก — เปิดหน้า Register / KYC
│   ├── login.page.ts         # หน้า Login — กรอกเบอร์โทรศัพท์ + เลขบัตรประชาชน
│   ├── otp.page.ts           # หน้า OTP — กรอกและยืนยัน OTP
│   ├── consent.page.ts       # หน้ายินยอม — ยอมรับเงื่อนไข
│   ├── kyc-photo.page.ts     # หน้าถ่าย/อัพโหลดรูปภาพ KYC
│   ├── personal-info.page.ts # หน้ากรอกข้อมูลส่วนตัว
│   ├── address.page.ts       # หน้ากรอกที่อยู่ + อาชีพ/รายได้
│   ├── pin.page.ts           # หน้าตั้ง PIN และยืนยัน PIN
│   └── result.page.ts        # หน้าผลลัพธ์ — Success / Waiting / Not Found
├── test/
│   ├── verify-your-identity.spec.ts  # Test: KYC ทุก flow (userA, userB, userC)
│   └── register.spec.ts              # Test: Register flow ครบขั้นตอน (userD)
├── utils/
│   ├── users.json            # ข้อมูล user สำหรับ test (ถูก .gitignore)
│   ├── data.json             # ข้อมูล test เช่น OTP, PIN, ข้อมูลส่วนตัว, ที่อยู่
│   ├── random.ts             # สุ่มเบอร์โทรศัพท์ไทย + เลขบัตรประชาชนที่ถูกต้อง
│   └── src/
│       ├── selfie.png        # รูป selfie สำหรับ KYC
│       └── idCard.png        # รูปบัตรประชาชนสำหรับ KYC
├── scripts/
│   └── generate-dashboard.js # สร้าง Dashboard HTML จาก test results
├── .env                      # Environment variables (BASE_URL)
├── dashboard.html            # Test Results Dashboard (auto-generated)
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

ใส่ `"random"` เพื่อให้ระบบสุ่มค่าที่ถูกต้องตามรูปแบบไทยทุก run:

```json
{
  "userD": { "phone": "random", "idcard": "random" }
}
```

| Key   | Flow              | คำอธิบาย                                       |
|-------|-------------------|------------------------------------------------|
| userA | KYC Success       | ผ่านการยืนยันตัวตนสำเร็จ                       |
| userB | User Not Found    | ไม่พบข้อมูลในระบบ                              |
| userC | KYC Waiting       | อยู่ระหว่างรอตรวจสอบ                           |
| userD | Register          | สมัครสมาชิกใหม่ — สุ่มเบอร์/เลขบัตรทุก run    |

---

## ข้อมูล Test (data.json)

`utils/data.json` เก็บข้อมูลที่ใช้ใน test แบ่งเป็น:

- `common` — ข้อมูลกลาง เช่น OTP
- `userD` — ข้อมูลเฉพาะ Register flow: ข้อมูลส่วนตัว, ที่อยู่, PIN, path ไฟล์รูปภาพ

---

## การรัน Test

### ใช้ npm scripts (แนะนำ)

```bash
# รัน test ทั้งหมด
npm test

# รัน test พร้อมดู browser (headed mode)
npm run test:headed

# รัน test เฉพาะ KYC flows
npm run test:verify

# รัน test เฉพาะ Register flow
npm run test:register

# ดู HTML report หลังรัน test
npm run test:report

# สร้าง Dashboard จาก results ที่มีอยู่แล้ว แล้วเปิด browser
npm run dashboard

# รัน test ทั้งหมด แล้วเปิด Dashboard ต่อเลย
npm run test:dashboard

# ติดตั้ง browser (ครั้งแรก)
npm run install:browsers
```

### ใช้ Playwright CLI โดยตรง

```bash
# รัน test ทั้งหมด
npx playwright test

# รัน test เฉพาะไฟล์
npx playwright test test/verify-your-identity.spec.ts
npx playwright test test/register.spec.ts

# รันพร้อมดู browser (headed mode)
npx playwright test --headed

# ดู HTML report หลังรัน test
npx playwright show-report
```

---

## Test Cases

### KYC Flow — `test/verify-your-identity.spec.ts`

| # | Test | User | ผลลัพธ์ที่คาดหวัง |
|---|------|------|-------------------|
| 1 | KYC → success status | userA | แสดง "สมัคร BeWallet สำเร็จ" → กลับหน้าแรก |
| 2 | KYC → user not found | userB | แสดง "ไม่สามารถทำรายการได้" |
| 3 | KYC → waiting status | userC | แสดง "กำลังตรวจสอบการยืนยันตัวตน" → กลับหน้าแรก |

### Register Flow — `test/register.spec.ts`

| # | Test | User | ขั้นตอน |
|---|------|------|---------|
| 1 | Register → waiting status | userD | Login → OTP → Consent → ถ่าย/อัพโหลดรูป → ข้อมูลส่วนตัว → ที่อยู่ → ตั้ง PIN → ยืนยัน PIN → แสดง "กำลังตรวจสอบการยืนยันตัวตน" |

---

## Test Dashboard

หลังจากรัน test แล้ว สามารถเปิด Dashboard สรุปผลแบบ visual ได้ด้วย:

```bash
npm run test:dashboard   # รัน test + เปิด Dashboard
npm run dashboard        # เปิด Dashboard จาก results ล่าสุด
```

Dashboard แสดง:
- สถานะรวม (PASSED / FAILED) พร้อมวันเวลาและระยะเวลาที่ใช้
- Stat Cards — Total / Passed / Failed / Skipped พร้อม count-up animation
- Donut Chart — สัดส่วน pass/fail/skip
- Pass Rate Progress Bar
- Test Suite Cards — แยกตามไฟล์ พร้อม duration bar ของแต่ละ test
- Error message สำหรับ test ที่ fail

> Dashboard ถูก generate เป็นไฟล์ `dashboard.html` ที่ root และเปิด browser อัตโนมัติ

---

## User Fixture

Test แต่ละตัวกำหนด user ผ่าน `@user <key>` ในชื่อ test:

```typescript
test('@user userD Register flow', async ({ page, user }) => {
  // user.phone และ user.idcard ถูก inject อัตโนมัติ
  // หากค่าใน users.json เป็น "random" จะสุ่มค่าที่ถูกต้องให้อัตโนมัติ
});
```

Fixture จะอ่านชื่อ test, แยก key หลัง `@user`, โหลดข้อมูลจาก `utils/users.json` และ log phone/idcard ที่ใช้จริงออก console ทุก run

---

## Configuration หลัก

| ค่า              | รายละเอียด                              |
|------------------|-----------------------------------------|
| Browser          | Firefox                                 |
| Viewport         | 1920 × 1080                             |
| Animation        | ปิดทั้งหมด (ลด flaky)                   |
| Test Timeout     | 120 วินาที ต่อ test                     |
| Expect Timeout   | 15 วินาที ต่อ assertion/waitFor         |
| Parallel         | เปิด (fullyParallel: true)              |
| Retry (CI)       | 2 ครั้ง                                 |
| Reporter         | HTML + JSON (`test-results/results.json`) |
| Base URL         | กำหนดจาก `.env` → `BASE_URL`           |
