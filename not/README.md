# S/B Notlar & Yapılacaklar (Black & White Notes)

Minimalist, siyah-beyaz temalı, Firestore tabanlı, sürükle-bırak destekli not alma ve yapılacaklar listesi uygulaması.

## Özellikler

*   **Minimalist Tasarım:** Sadece işinize odaklanmanızı sağlayan temiz, siyah ve beyaz renk paleti.
*   **İki Mod:** Hem düz metin notları hem de işaretlenebilir yapılacaklar (todo) listesi.
*   **Klasörleme Sistemi:**
    *   İstediğiniz kadar klasör oluşturun ve notlarınızı kategorize edin.
    *   **Sürükle-Bırak:** Notları veya yapılacakları tutup sol menüdeki klasörlere bırakarak kolayca taşıyın.
    *   **Filtreleme:** Klasör isimlerine tıklayarak sadece ilgili içerikleri görün.
*   **Veritabanı Entegrasyonu:** Tüm veriler Firebase Firestore üzerinde güvenle saklanır.
*   **Gerçek Zamanlı (Real-time):** Başka bir sekmede veya cihazda değişiklik yaptığınızda anında güncellenir.
*   **Görsel Klasör Etiketleri:** Notların ve yapılacakların üzerinde hangi klasörde olduklarını gösteren etiketler bulunur.

## Kurulum ve Çalıştırma

Bu proje istemci taraflı (client-side) bir uygulamadır. Çalıştırmak için herhangi bir sunucu kurulumuna ihtiyacınız yoktur, ancak kendi Firebase projenizi bağlamanız gerekir.

### 1. Dosyaları İndirin
Projeyi bilgisayarınıza indirin veya `git clone` ile çekin:

```bash
git clone https://github.com/kullaniciadi/proje-adi.git
```

### 2. Firebase Kurulumu
1.  Firebase Console adresine gidin.
2.  Yeni bir proje oluşturun.
3.  **Firestore Database** seçeneğine gidin ve bir veritabanı oluşturun.
4.  **Kurallar (Rules)** kısmını geliştirme aşaması için `allow read, write: if true;` olarak ayarlayın.
5.  Proje ayarlarından "Web App" ekleyin ve size verilen `firebaseConfig` kodunu kopyalayın.

### 3. Yapılandırma
`app.js` dosyasını açın ve en üstteki `firebaseConfig` objesini kendi projenizin bilgileriyle değiştirin.

### 4. Çalıştırma
`index.html` dosyasına çift tıklayarak tarayıcınızda açın.

## Önemli Not
Klasörleme ve tarihe göre sıralama işlemini aynı anda yaptığımız için Firebase bazen bir **"Composite Index"** oluşturmanızı isteyebilir. Böyle bir durumda tarayıcı konsolunda (F12) size verilen linke tıklayarak indeksi oluşturabilirsiniz.

## Lisans
Bu proje açık kaynaklıdır ve eğitim amaçlı geliştirilmiştir.
