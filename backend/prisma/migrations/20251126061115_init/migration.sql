-- CreateTable
CREATE TABLE `users` (
    `id_pengguna` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `kata_sandi` VARCHAR(255) NOT NULL,
    `tanggal_daftar` DATE NOT NULL,
    `status_akun` ENUM('Aktif', 'Tidak Aktif') NULL DEFAULT 'Aktif',
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id_pengguna`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id_kategori` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nama_kategori` VARCHAR(100) NOT NULL,
    `tipe_kategori` ENUM('Manual', 'Dinamis') NOT NULL,

    PRIMARY KEY (`id_kategori`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_methods` (
    `id_metode` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nama_metode` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_metode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `currencies` (
    `id_mata_uang` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `kode_mata_uang` VARCHAR(5) NOT NULL,
    `nama_mata_uang` VARCHAR(50) NOT NULL,
    `nilai_tukar` DECIMAL(18, 4) NULL,

    UNIQUE INDEX `currencies_kode_mata_uang_key`(`kode_mata_uang`),
    PRIMARY KEY (`id_mata_uang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `budgets` (
    `id_anggaran` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_pengguna` INTEGER UNSIGNED NOT NULL,
    `id_kategori` INTEGER UNSIGNED NOT NULL,
    `jumlah_anggaran` DECIMAL(18, 2) NOT NULL,
    `bulan` INTEGER NOT NULL,
    `tahun` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `budgets_id_pengguna_idx`(`id_pengguna`),
    INDEX `budgets_id_kategori_idx`(`id_kategori`),
    UNIQUE INDEX `budgets_id_pengguna_id_kategori_bulan_tahun_key`(`id_pengguna`, `id_kategori`, `bulan`, `tahun`),
    PRIMARY KEY (`id_anggaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expenses` (
    `id_pengeluaran` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_pengguna` INTEGER UNSIGNED NOT NULL,
    `id_kategori` INTEGER UNSIGNED NOT NULL,
    `id_metode` INTEGER UNSIGNED NOT NULL,
    `id_mata_uang` INTEGER UNSIGNED NOT NULL,
    `jumlah` DECIMAL(18, 2) NOT NULL,
    `tanggal` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_pengguna`(`id_pengguna`),
    INDEX `expenses_id_kategori_idx`(`id_kategori`),
    INDEX `expenses_id_metode_idx`(`id_metode`),
    INDEX `expenses_id_mata_uang_idx`(`id_mata_uang`),
    PRIMARY KEY (`id_pengeluaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `incomes` (
    `id_pemasukan` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_pengguna` INTEGER UNSIGNED NOT NULL,
    `id_metode` INTEGER UNSIGNED NOT NULL,
    `id_mata_uang` INTEGER UNSIGNED NOT NULL,
    `jumlah` DECIMAL(18, 2) NOT NULL,
    `sumber` VARCHAR(100) NULL,
    `tanggal` DATE NOT NULL,

    INDEX `incomes_id_pengguna_idx`(`id_pengguna`),
    INDEX `incomes_id_metode_idx`(`id_metode`),
    INDEX `incomes_id_mata_uang_idx`(`id_mata_uang`),
    PRIMARY KEY (`id_pemasukan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `debts` (
    `id_utang` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_pengguna` INTEGER UNSIGNED NOT NULL,
    `jumlah_utang` DECIMAL(18, 2) NOT NULL,
    `tanggal_tenggat` DATE NOT NULL,
    `status_utang` ENUM('Belum Dibayar', 'Dibayar Sebagian', 'Lunas') NOT NULL DEFAULT 'Belum Dibayar',

    INDEX `debts_id_pengguna_idx`(`id_pengguna`),
    PRIMARY KEY (`id_utang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `receivables` (
    `id_piutang` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_pengguna` INTEGER UNSIGNED NOT NULL,
    `jumlah_piutang` DECIMAL(18, 2) NOT NULL,
    `tanggal_tenggat` DATE NOT NULL,
    `status_piutang` ENUM('Belum Diterima', 'Diterima Sebagian', 'Lunas') NOT NULL DEFAULT 'Belum Diterima',

    INDEX `receivables_id_pengguna_idx`(`id_pengguna`),
    PRIMARY KEY (`id_piutang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `financial_goals` (
    `id_tujuan` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_pengguna` INTEGER UNSIGNED NOT NULL,
    `nama_tujuan` VARCHAR(100) NOT NULL,
    `total_target` DECIMAL(18, 2) NOT NULL,
    `tanggal_target` DATE NOT NULL,
    `status` ENUM('Tercapai', 'Belum Tercapai') NOT NULL DEFAULT 'Belum Tercapai',

    INDEX `financial_goals_id_pengguna_idx`(`id_pengguna`),
    PRIMARY KEY (`id_tujuan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `financial_predictions` (
    `id_prediksi` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_pengguna` INTEGER UNSIGNED NOT NULL,
    `bulan_prediksi` INTEGER NOT NULL,
    `estimasi_pemasukan` DECIMAL(18, 2) NULL,
    `estimasi_pengeluaran` DECIMAL(18, 2) NULL,
    `prediksi_saldo_akhir` DECIMAL(18, 2) NULL,

    INDEX `financial_predictions_id_pengguna_idx`(`id_pengguna`),
    PRIMARY KEY (`id_prediksi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_user_relations` (
    `id_relasi` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_pengguna1` INTEGER UNSIGNED NOT NULL,
    `id_pengguna2` INTEGER UNSIGNED NOT NULL,
    `status_relasi` ENUM('Pending', 'Accepted') NOT NULL DEFAULT 'Pending',

    INDEX `social_user_relations_id_pengguna2_idx`(`id_pengguna2`),
    UNIQUE INDEX `social_user_relations_id_pengguna1_id_pengguna2_key`(`id_pengguna1`, `id_pengguna2`),
    PRIMARY KEY (`id_relasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notes` (
    `id_note` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_pengguna` INTEGER UNSIGNED NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `content` TEXT NOT NULL,
    `color` VARCHAR(30) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `notes_id_pengguna_idx`(`id_pengguna`),
    PRIMARY KEY (`id_note`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calendar_events` (
    `id_event` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_pengguna` INTEGER UNSIGNED NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `all_day` BOOLEAN NOT NULL DEFAULT false,
    `color` VARCHAR(30) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `calendar_events_id_pengguna_idx`(`id_pengguna`),
    PRIMARY KEY (`id_event`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `users`(`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `budgets` ADD CONSTRAINT `budgets_id_kategori_fkey` FOREIGN KEY (`id_kategori`) REFERENCES `categories`(`id_kategori`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `users`(`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_id_kategori_fkey` FOREIGN KEY (`id_kategori`) REFERENCES `categories`(`id_kategori`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_id_metode_fkey` FOREIGN KEY (`id_metode`) REFERENCES `payment_methods`(`id_metode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_id_mata_uang_fkey` FOREIGN KEY (`id_mata_uang`) REFERENCES `currencies`(`id_mata_uang`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incomes` ADD CONSTRAINT `incomes_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `users`(`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incomes` ADD CONSTRAINT `incomes_id_metode_fkey` FOREIGN KEY (`id_metode`) REFERENCES `payment_methods`(`id_metode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incomes` ADD CONSTRAINT `incomes_id_mata_uang_fkey` FOREIGN KEY (`id_mata_uang`) REFERENCES `currencies`(`id_mata_uang`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debts` ADD CONSTRAINT `debts_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `users`(`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `receivables` ADD CONSTRAINT `receivables_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `users`(`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial_goals` ADD CONSTRAINT `financial_goals_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `users`(`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial_predictions` ADD CONSTRAINT `financial_predictions_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `users`(`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_user_relations` ADD CONSTRAINT `social_user_relations_id_pengguna1_fkey` FOREIGN KEY (`id_pengguna1`) REFERENCES `users`(`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_user_relations` ADD CONSTRAINT `social_user_relations_id_pengguna2_fkey` FOREIGN KEY (`id_pengguna2`) REFERENCES `users`(`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notes` ADD CONSTRAINT `notes_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `users`(`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_id_pengguna_fkey` FOREIGN KEY (`id_pengguna`) REFERENCES `users`(`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;
