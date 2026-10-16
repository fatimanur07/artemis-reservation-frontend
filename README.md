# 🏨 Artemis Luxury Resort - Otel Rezervasyon & Yönetim Platformu (Frontend)

Bu proje; **Artemis Luxury Resort** için geliştirilmiş, lüks misafir rezervasyon deneyimini ve kapsamlı otel resepsiyon/yönetim operasyonlarını tek bir çatı altında toplayan modern bir Full-Stack web otomasyonudur.

Sistem, misafirlerin web sitesi üzerinden oda kiralayabildiği **Misafir Portalı** ve otel personelinin kasa, oda envanteri ve rezervasyonları takip ettiği **Yönetici Paneli** olmak üzere iki bağımsız deneyim sunar.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

### 🎨 Frontend
* **Kütüphane:** React 18
* **Geliştirme / Derleyici:** Vite
* **HTTP İstemcisi:** Axios (JWT Bearer Token yetkilendirmeli)
* **Tasarım:** Saf ve Modern CSS (4K Arka Planlı Glassmorphism, Responsive Tasarım)

### ⚙️ Backend
* **Çatı (Framework):** NestJS
* **Dil:** TypeScript
* **Veritabanı:** SQLite
* **ORM:** Prisma ORM
* **Güvenlik & Yetkilendirme:** JWT (JSON Web Token), Passport & bcrypt
* **Doğrulama:** class-validator & class-transformer (ValidationPipe)

---

## 🎯 Proje İsterleri ve Karşılanan Özellikler

### 1. Kimlik Doğrulama & Rol Bazlı Veri İzolasyonu
* **Giriş Sistemi:** `/auth/register` ve `/auth/login` uç noktaları üzerinden JWT tabanlı güvenli oturum yönetimi.
* **Veri İzolasyonu:** Misafirler sadece kendilerine ait rezervasyonları görüntüleyebilir, güncelleyebilir veya iptal edebilir. Başka bir misafirin verisine erişim engellenmiştir.
* **Yönetici Girişi:** Yönetici paneline yalnızca yetkili yönetici hesabı (`fatima@test.com`) erişebilir. Misafir girişinden bu hesapla giriş yapılamaz; yetkisiz erişimlerde standart hata mesajı döndürülür.

### 2. İlişkili Veri Tipleri (Prisma ORM)
Veritabanında bire-çok (`1-to-N`) ilişkisel model kurgulanmıştır:
* `User` (Kullanıcı / Müşteri modeli)
* `Reservation` (Kullanıcıya `userId` yabancı anahtarı ile bağlı rezervasyon modeli)

### 3. Gelen Verilerin Doğrulanması (Validation)
Tüm istek gövdeleri (DTO), NestJS `ValidationPipe` katmanında sıkı tip, tarih ve e-posta formatı kontrollerinden geçirilir.

---

## 🌟 Öne Çıkan Sistem Modülleri

### 👤 Misafir Portalı (Guest Experience)
* **4K Karşılama:** Giriş ekranında 4K çözünürlükte lüks Akdeniz resort teması.
* **Otel Olanakları:** Zengin açık büfe sabah kahvaltısı, mavi bayraklı özel plaj, sonsuzluk havuzu, SPA & Türk hamamı ve fitness merkezi tanıtım vitrini.
* **Farklılaştırılmış Oda Tipleri (Sabah Kahvaltısı Dahil):**
  * **Standart Oda (2.500 ₺):** Bahçe manzaralı, King Bed, ergonomik çalışma alanı.
  * **Deluxe King Süit (4.500 ₺):** Kısmi deniz manzaralı, dinlenme köşesi ve çift kişilik jakuzi.
  * **Executive Süit (6.800 ₺):** Tam panoramik deniz manzaralı, giyinme odası ve özel teras.
  * **Presidential Süit (12.000 ₺):** Penthouse teras jakuzisi, yemek salonu ve 24 saat VIP butler servisi.
* **Akıllı Rezervasyon Koruması:**
  * Misafirler oda numarası seçimiyle uğraşmaz; sistem seçilen tipe uygun ilk müsait odayı otomatik atar.
  * Geçmiş günlere rezervasyon yapılması takvim seviyesinde (`min={todayStr}`) engellenmiştir.
* **Dinamik Kartlı Ödeme:** "Banka Kartı" veya "Kredi Kartı" seçildiğinde 16 haneli kart numarası, son kullanma ve CVV alanları açılarak doğrulanır.
* **Şartlı Değerlendirme:** Misafirler otele yalnızca konaklamaları bitip çıkış yaptıktan (`check-out`) sonra yorum bırakabilir.

### 🏨 Yönetici / Resepsiyon Paneli (Admin Portal)
* **Canlı Finans & Kasa:** Tahsil edilen net kasa bakiyesi (Nakit/POS), bekleyen alacaklar ve detaylı fatura dökümleri.
* **Anlık Rezervasyon & Kanal Akışı:** Web sitesi üzerinden gelen rezervasyonlar **"Artemis Doğrudan Web"** kanal etiketiyle müşterinin adı, e-posta adresi ve oda bilgisiyle anında yönetici tablosuna düşer (müşterinin şifresi yöneticiye kesinlikle gösterilmez).
* **300 Oda & Kat Yönetimi:** Kat ve oda tipine göre tek tıkla filtreleme (Standart, Deluxe, Executive, Presidential) ve 12'şerli sayfalama (pagination).
* **Doluluk Takvimi:** Ayın günleri üzerinde şu anda kalan, geçmişte kalan, gelecekte kalacak ve iptal edilen rezervasyonlar misafir ismi ve oda numarasıyla renk kodlu etiketlenir.
* **Sadakat & Misafir Rehberi:** Misafirlerin geliş sıklığına göre otomatik atanan rozetler:
  * 1. Geliş: **Yeni Müşteri**
  * 2 - 3. Geliş: **Eski Müşteri**
  * 4+ Geliş: **Daimi Müşteri**

---

## 🗄️ Veritabanı Şeması (`schema.prisma`)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  password     String
  name         String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  reservations Reservation[]
}

model Reservation {
  id          String   @id @default(uuid())
  title       String
  startDate   DateTime
  endDate     DateTime
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
