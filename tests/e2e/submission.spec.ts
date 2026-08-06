import { test, expect } from '@playwright/test';

test.describe('Content Submission Flow', () => {
  
  test('Lembaga Admin mengajukan konten lalu Media Admin melakukan persetujuan', async ({ page }) => {
    // 1. Login sebagai Lembaga Admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'tk@app.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Pastikan masuk ke dashboard
    await expect(page).toHaveURL('/dashboard');

    // Buka form pengajuan baru
    await page.goto('/pengajuan/baru');
    
    // Isi form pengajuan
    const testTitle = `Test Konten E2E ${Date.now()}`;
    await page.fill('input[name="title"]', testTitle);
    await page.fill('textarea[name="description"]', 'Ini adalah deskripsi konten untuk testing E2E.');
    // Set tanggal hari ini
    await page.click('button:has-text("Pilih Tanggal")');
    await page.click('.rdp-day_today');
    
    // Asumsi ada checkbox platform (klik salah satu, misalnya index 0)
    await page.click('input[type="checkbox"]');

    // Submit
    await page.click('button:has-text("Submit Pengajuan")');

    // Harusnya redirect ke daftar pengajuan
    await expect(page).toHaveURL(/\/pengajuan\/.+/);
    
    // Ambil URL pengajuan untuk dicek Media Admin
    const submissionUrl = page.url();

    // 2. Logout
    await page.goto('/dashboard');
    // Asumsi tidak ada tombol logout yang jelas di E2E ini, kita paksa clear storage dan ke login
    await page.context().clearCookies();
    await page.goto('/login');

    // 3. Login sebagai Media Admin
    await page.fill('input[type="email"]', 'mediaadmin@app.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');

    // 4. Media Admin membuka halaman pengajuan tadi
    await page.goto(submissionUrl.replace('/pengajuan/', '/media/pengajuan/'));

    // Cek judul sesuai
    await expect(page.locator(`text=${testTitle}`)).toBeVisible();

    // Lakukan persetujuan (Approve)
    await page.fill('textarea[name="notes"]', 'Disetujui via E2E testing');
    await page.click('button:has-text("Setujui")');

    // Status harus berubah menjadi disetujui (atau ada info Riwayat "Disetujui")
    await expect(page.locator('text=Status Pengajuan telah diperbarui')).toBeVisible();
    await expect(page.locator('text=disetujui')).toBeVisible();
  });

});
