const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new"
    });

    const page = await browser.newPage();
    console.log("Tarayıcı açıldı");

    try {
        // Navigate to frontend
        await page.goto('http://localhost:5173/register');
        console.log("Kayıt sayfasına gidildi: http://localhost:5173/register");

        // Wait for the form to load
        await page.waitForSelector('#register-name');

        // Fill out the registration form
        const randInt = Math.floor(Math.random() * 100000);
        const email = `testuser${randInt}@example.com`;
        console.log(`Test kullanıcısı ile kayıt olunuyor: ${email}`);

        await page.type('#register-name', 'Test Kullanıcısı');
        await page.type('#register-email', email);
        await page.type('#register-password', 'GucluSifre123!');
        await page.type('#register-confirm', 'GucluSifre123!');

        // Click register
        await page.click('button[type="submit"]');

        // Wait for navigation to dashboard
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        console.log("Kayıt başarılı, Dashboard'a yönlendirildi!");

        // Verify we're on dashboard by checking for the "Yeni Görev" button
        await page.waitForSelector('button:has-text("Yeni Görev")', { timeout: 5000 });
        console.log("Dashboard yüklendi");

        // Open the new task modal
        await page.click('button:has-text("Yeni Görev")');
        await page.waitForSelector('#task-title', { visible: true });
        console.log("Yeni görev modalı açıldı");

        // Fill task details
        await page.type('#task-title', 'E2E Test Görevi: Backend & Frontend Entegrasyonu');
        await page.type('#task-description', 'Bu görev Puppeteer tarafından otomatik olarak oluşturuldu.');
        await page.select('#task-priority', 'acil');
        await page.select('#task-category', 'iş');

        // Submit task
        await page.click('.modal-footer button.btn-primary');
        console.log("Görev oluşturma isteği gönderildi");

        // Wait for modal to close and task to appear
        await page.waitForSelector('.task-card-title', { visible: true });

        // Check if task exists on the board
        const taskTitle = await page.$eval('.task-card-title', el => el.textContent);
        console.log(`Panoda yeni görev bulundu: "${taskTitle}"`);

        if (taskTitle.includes('E2E Test Görevi')) {
            console.log('✅ TEST BAŞARILI: Uçtan uca kayıt ve görev oluşturma akışı çalışıyor!');
        } else {
            console.error('❌ TEST BAŞARISIZ: Oluşturulan görev panoda bulunamadı.');
        }

    } catch (error) {
        console.error('Test sırasında hata oluştu:', error);
    } finally {
        await browser.close();
        console.log("Tarayıcı kapatıldı");
    }
})();
