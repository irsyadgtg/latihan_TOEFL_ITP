

# Latihan TOEFL ITP

[![Laravel](https://img.shields.io/badge/framework-Laravel-FF2D20?logo=laravel&logoColor=white)]()
[![React](https://img.shields.io/badge/library-React-61DAFB?logo=react&logoColor=black)]()

Aplikasi web untuk latihan TOEFL ITP secara self-paced.  Aplikasi ini menyediakan modul pembelajaran untuk latihan **Listening, Structure & Written Expression, Reading, dan Simulation Test**, serta melacak kemajuan pengguna.  

Backend menggunakan **Laravel**, frontend menggunakan **React (Vite)**.  

Panduan ini akan memandu kamu **step-by-step** agar aplikasi bisa dijalankan di lokal.

---

## Daftar Isi

1. [Teknologi](#teknologi)  
2. [Prasyarat](#prasyarat)  
3. [Instalasi](#instalasi)  
   - [Backend](#backend)  
   - [Frontend](#frontend)  
4. [Pengaturan Lingkungan](#pengaturan-lingkungan)  
5. [Menjalankan Aplikasi](#menjalankan-aplikasi)  

---

## Teknologi

**Backend:**  
- Laravel 10  
- MySQL   
- PHP 8+  
- Composer  

**Frontend:**  
- React.js (Vite)  
- Axios  
- Tailwind CSS / Bootstrap  

---

## Prasyarat

Pastikan sudah terinstall:

- PHP >= 8.1  
- Composer  
- Node.js >= 18  
- npm atau yarn  
- MySQL / MariaDB  
- Git  

---

## Instalasi

### Backend

1. Clone repository:  
```bash
git clone https://github.com/irsyadgtg/latihan_TOEFL_ITP.git
cd latihan_TOEFL_ITP/backend
````

2. Install dependencies:

```bash
composer install
```

3. Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

4. Konfigurasi database di `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=toefl_itp
DB_USERNAME=root
DB_PASSWORD=
```

> Pastikan database `toefl_itp` sudah dibuat di MySQL.

5. Konfigurasi email menggunakan **Mailtrap** untuk testing email di lokal:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=example@example.com
MAIL_FROM_NAME="Latihan TOEFL ITP"
```

> Ganti `your_mailtrap_username` dan `your_mailtrap_password` sesuai akun Mailtrap kamu.

6. Generate key aplikasi:

```bash
php artisan key:generate
```

7. Jalankan migrasi dan seeder:

```bash
php artisan migrate --seed
```

---

### Frontend

1. Masuk ke folder frontend:

```bash
cd ../frontend
```

2. Install dependencies:

```bash
npm install
```

> Bisa juga pakai `yarn install` kalau menggunakan yarn.

3. Konfigurasi base URL API di `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

---

## Pengaturan Lingkungan

Pastikan pengaturan berikut sudah siap:

* Backend Laravel berjalan di port 8000
* Frontend Vite berjalan di port 5173
* Database MySQL dibuat sesuai `.env`

---

## Menjalankan Aplikasi

### Jalankan Backend

```bash
php artisan serve
```

Backend berjalan di: `http://127.0.0.1:8000`

### Jalankan Frontend

```bash
npm run dev
```

Frontend berjalan di browser: `http://127.0.0.1:5173`

> Jika ada fitur kirim email, cek Mailtrap untuk melihat email yang dikirim.

```
