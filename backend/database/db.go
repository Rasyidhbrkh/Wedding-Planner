package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/glebarez/sqlite"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"wedding-planner-api/models"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	dbType := os.Getenv("DB_TYPE")
	if dbType == "" {
		dbType = "mysql"
	}

	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "127.0.0.1"
	}

	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "3306"
	}

	user := os.Getenv("DB_USER")
	if user == "" {
		user = "root"
	}

	password := os.Getenv("DB_PASSWORD")

	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "wedding_planner"
	}

	var db *gorm.DB
	var err error

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	if dbType == "mysql" {
		dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			user, password, host, port, dbName)
		log.Printf("[DB] Connecting to MySQL at %s:%s/%s...", host, port, dbName)
		db, err = gorm.Open(mysql.Open(dsn), gormConfig)

		if err != nil && password == "" {
			// Try with password "root" (common in Docker Compose)
			dsnRoot := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
				user, "root", host, port, dbName)
			db, err = gorm.Open(mysql.Open(dsnRoot), gormConfig)
		}

		if err != nil {
			log.Printf("[DB] ⚠️ Gagal terhubung ke MySQL (%v).", err)
			log.Printf("[DB] 💡 Menggunakan database fallback SQLite (wedding_planner.db) agar aplikasi tetap berjalan langsung tanpa crash.")
			db, err = gorm.Open(sqlite.Open("wedding_planner.db"), gormConfig)
			if err != nil {
				log.Fatalf("[DB] Fatal: Gagal menginisialisasi SQLite fallback: %v", err)
			}
		} else {
			log.Printf("[DB] ✅ Berhasil terhubung ke database MySQL (%s)!", dbName)
		}
	} else {
		log.Printf("[DB] Using SQLite database...")
		db, err = gorm.Open(sqlite.Open("wedding_planner.db"), gormConfig)
		if err != nil {
			log.Fatalf("[DB] Fatal: Gagal membuka SQLite: %v", err)
		}
	}

	// Auto Migration
	err = db.AutoMigrate(
		&models.WeddingProfile{},
		&models.SavingsRecord{},
		&models.BudgetItem{},
		&models.ChecklistItem{},
		&models.RundownItem{},
		&models.Guest{},
		&models.Vendor{},
		&models.SeatingTable{},
		&models.BridalPartyMember{},
		&models.User{},
	)
	if err != nil {
		log.Printf("[DB] AutoMigrate warning: %v", err)
	}

	DB = db
	seedInitialData(db)
	return db
}

func seedInitialData(db *gorm.DB) {
	// Seed only the 'pengantin' user
	var pengantinUser models.User
	err := db.Where("username = ?", "pengantin").First(&pengantinUser).Error
	if err != nil || pengantinUser.ID == 0 {
		weddingPass, _ := bcrypt.GenerateFromPassword([]byte("wedding123"), bcrypt.DefaultCost)
		pengantinUser = models.User{
			Username:     "pengantin",
			Name:         "Pengantin",
			Role:         "pengantin",
			PasswordHash: string(weddingPass),
		}
		if err := db.Create(&pengantinUser).Error; err != nil {
			log.Printf("[DB] Error creating user pengantin: %v", err)
			return
		}
		log.Printf("[DB] ✅ User pengantin successfully created (ID: %d)", pengantinUser.ID)
	}

	uid := pengantinUser.ID

	// Seed Profile for pengantin user
	var profileCount int64
	db.Model(&models.WeddingProfile{}).Where("user_id = ?", uid).Count(&profileCount)
	if profileCount == 0 {
		profile := models.WeddingProfile{
			UserID:        uid,
			BrideName:     "Nisrinei Listiawati",
			GroomName:     "Muhamad Rasyid Habibbarkah",
			WeddingDate:   time.Now().AddDate(0, 4, 15).Format("2006-01-02"),
			Location:      "Grand Ballroom & Garden Venue, Jakarta",
			TotalBudget:   50000000,
			TargetSavings: 50000000,
			Notes:         "Konsep Pernikahan: Modern Elegant & Traditional Touch",
		}
		db.Create(&profile)
	}

	// Seed Checklist for pengantin user
	var checklistCount int64
	db.Model(&models.ChecklistItem{}).Where("user_id = ?", uid).Count(&checklistCount)
	if checklistCount == 0 {
		initialChecklist := []models.ChecklistItem{
			{UserID: uid, Phase: "H-12 bulan", Task: "Tentukan tanggal & estimasi budget total pernikahan", PIC: "Kedua Mempelai", IsCompleted: true, Notes: "Diskusi bersama keluarga besar"},
			{UserID: uid, Phase: "H-12 bulan", Task: "Survey dan booking venue / gedung pernikahan", PIC: "Mempelai Pria", IsCompleted: true, Notes: "Lokasi strategis & kapasitas 500 tamu"},
			{UserID: uid, Phase: "H-10 bulan", Task: "Booking vendor katering & uji rasa (food testing)", PIC: "Mempelai Wanita", IsCompleted: false, Notes: "Menu buffet nusantara & dessert corner"},
			{UserID: uid, Phase: "H-10 bulan", Task: "Booking fotografer & videografer (Prewedding & Hari-H)", PIC: "Mempelai Pria", IsCompleted: false, Notes: "Paket lengkap album & cinematic video"},
			{UserID: uid, Phase: "H-9 bulan", Task: "Pilih dan pesan busana pengantin & seragam keluarga", PIC: "Mempelai Wanita", IsCompleted: false, Notes: "Akad dan resepsi"},
			{UserID: uid, Phase: "H-8 bulan", Task: "Susun estimasi daftar tamu undangan pihak pria & wanita", PIC: "Kedua Mempelai", IsCompleted: true, Notes: "Target 250 undangan (500 pax)"},
			{UserID: uid, Phase: "H-6 bulan", Task: "Desain undangan digital & cetak", PIC: "Mempelai Pria", IsCompleted: false, Notes: "Website undangan + kartu fisik VIP"},
			{UserID: uid, Phase: "H-6 bulan", Task: "Booking MUA (Make Up Artist) & Hair Do / Hijab Do", PIC: "Mempelai Wanita", IsCompleted: false, Notes: "Termasuk rias ibu & pendamping"},
			{UserID: uid, Phase: "H-5 bulan", Task: "Booking MC, Sound System & hiburan musik akustik", PIC: "Mempelai Pria", IsCompleted: false, Notes: "Playlist lagu romantis modern"},
			{UserID: uid, Phase: "H-4 bulan", Task: "Pesan cincin pernikahan & grafir nama", PIC: "Kedua Mempelai", IsCompleted: false, Notes: "Emas putih / Palladium"},
			{UserID: uid, Phase: "H-3 bulan", Task: "Urus dokumen pernikahan ke KUA / Catatan Sipil", PIC: "Mempelai Pria", IsCompleted: false, Notes: "Surat pengantar RT/RW, N1-N4, SKCK, suntik TT"},
			{UserID: uid, Phase: "H-3 bulan", Task: "Distribusi undangan digital & kirim undangan fisik", PIC: "Kedua Mempelai", IsCompleted: false, Notes: "Follow up konfirmasi kehadiran (RSVP)"},
			{UserID: uid, Phase: "H-2 bulan", Task: "Fitting final busana pengantin & orang tua", PIC: "Mempelai Wanita", IsCompleted: false, Notes: "Penyesuaian ukuran terakhir"},
			{UserID: uid, Phase: "H-1 bulan", Task: "Konfirmasi ulang (technical meeting) semua vendor", PIC: "WO / PIC Acara", IsCompleted: false, Notes: "Pastikan timeline & rundown sinkron"},
			{UserID: uid, Phase: "H-2 minggu", Task: "Rekap konfirmasi kehadiran tamu & finalisasi nomor meja", PIC: "Kedua Mempelai", IsCompleted: false, Notes: "Susun denah meja tamu VIP"},
			{UserID: uid, Phase: "H-1 minggu", Task: "Gladi resik / rehearsal tata cara akad & resepsi", PIC: "Keluarga & WO", IsCompleted: false, Notes: "Briefing panitia & bridesmaid/groomsman"},
			{UserID: uid, Phase: "H-1 hari", Task: "Persiapan akhir, cek hantaran/mas kawin & istirahat cukup", PIC: "Kedua Mempelai", IsCompleted: false, Notes: "Relaksasi & jaga kesehatan"},
			{UserID: uid, Phase: "Hari-H", Task: "Pelaksanaan Akad Nikah & Resepsi Pernikahan", PIC: "Semua Panitia & WO", IsCompleted: false, Notes: "Momen bahagia berjalan lancar"},
			{UserID: uid, Phase: "H+1 minggu", Task: "Kirim ucapan terima kasih kepada seluruh tamu & vendor", PIC: "Kedua Mempelai", IsCompleted: false, Notes: "Kirim foto kilas balik via WA"},
			{UserID: uid, Phase: "H+1 bulan", Task: "Terima hasil album foto, video cinematic & review vendor", PIC: "Kedua Mempelai", IsCompleted: false, Notes: "Arsip kenangan terindah"},
		}
		db.Create(&initialChecklist)
	}

	// Seed Rundown for pengantin user
	var rundownCount int64
	db.Model(&models.RundownItem{}).Where("user_id = ?", uid).Count(&rundownCount)
	if rundownCount == 0 {
		initialRundown := []models.RundownItem{
			{UserID: uid, Time: "05.00 - 06.00", Activity: "Wedding Organizer & Vendor mulai loading & persiapan venue", PIC: "WO Team", Location: "Gedung Utama", OrderIndex: 1},
			{UserID: uid, Time: "06.00 - 07.30", Activity: "Rias pengantin wanita, ibu pengantin, & bridesmaid", PIC: "MUA Team", Location: "Ruang Rias 1", OrderIndex: 2},
			{UserID: uid, Time: "07.30 - 08.30", Activity: "Rias pengantin pria & keluarga inti pria", PIC: "MUA Team", Location: "Ruang Rias 2", OrderIndex: 3},
			{UserID: uid, Time: "08.30 - 09.00", Activity: "Sesi foto pengantin & keluarga inti sebelum akad", PIC: "Fotografer", Location: "Lobby / Stage", OrderIndex: 4},
			{UserID: uid, Time: "09.00 - 10.15", Activity: "Prosesi Akad Nikah / Ijab Kabul & Khutbah Nikah", PIC: "Penghulu & Saksi", Location: "Meja Akad Utama", OrderIndex: 5},
			{UserID: uid, Time: "10.15 - 11.00", Activity: "Sungkeman, penyerahan mahar & sesi foto bersama keluarga besar", PIC: "MC & WO", Location: "Pelaminan", OrderIndex: 6},
			{UserID: uid, Time: "11.00 - 11.30", Activity: "Retouch makeup, ganti busana resepsi & persiapan kirab", PIC: "MUA & WO", Location: "Ruang Rias", OrderIndex: 7},
			{UserID: uid, Time: "11.30 - 12.00", Activity: "Kirab pengantin memasuki ballroom & pembukaan resepsi", PIC: "MC & Tim Kirab", Location: "Ballroom", OrderIndex: 8},
			{UserID: uid, Time: "12.00 - 12.30", Activity: "Sambutan perwakilan keluarga & pembacaan doa", PIC: "Tokoh Keluarga", Location: "Stage Pelaminan", OrderIndex: 9},
			{UserID: uid, Time: "12.30 - 14.30", Activity: "Ramah tamah, makan siang prasmanan & live acoustic music", PIC: "Vendor Katering & Musik", Location: "Ballroom & Dining Area", OrderIndex: 10},
			{UserID: uid, Time: "14.30 - 15.15", Activity: "Sesi foto bersama tamu undangan & sahabat", PIC: "Among Tamu & Fotografer", Location: "Pelaminan", OrderIndex: 11},
			{UserID: uid, Time: "15.15 - 15.45", Activity: "Games seru & tradisi lempar buket bunga pengantin", PIC: "MC & Pengantin", Location: "Tengah Ballroom", OrderIndex: 12},
			{UserID: uid, Time: "16.00 - 16.30", Activity: "Penutupan acara resepsi & pelepasan tamu undangan", PIC: "MC & Keluarga", Location: "Pintu Keluar", OrderIndex: 13},
			{UserID: uid, Time: "16.30 - 17.30", Activity: "Beres-beres venue, serah terima sisa katering, souvenir & evaluasi", PIC: "WO & Panitia Keluarga", Location: "Venue Area", OrderIndex: 14},
		}
		db.Create(&initialRundown)
	}

	// Seed Budget Items for pengantin user
	var budgetCount int64
	db.Model(&models.BudgetItem{}).Where("user_id = ?", uid).Count(&budgetCount)
	if budgetCount == 0 {
		initialBudget := []models.BudgetItem{
			{UserID: uid, Category: "🏛️ Venue / Gedung", Name: "Sewa Gedung & Ballroom", EstimatedCost: 15000000, ActualCost: 15000000, PaidAmount: 7500000, Remaining: 7500000, Status: "DP", Notes: "Termasuk kursi 300 buah & sound standard"},
			{UserID: uid, Category: "🍽️ Katering", Name: "Paket Prasmanan 500 Pax + Food Stalls", EstimatedCost: 16000000, ActualCost: 16000000, PaidAmount: 5000000, Remaining: 11000000, Status: "DP", Notes: "5 menu utama, 3 stall gubukan"},
			{UserID: uid, Category: "💐 Dekorasi & Bunga", Name: "Pelaminan Modern Rustik & Lorong Masuk", EstimatedCost: 6500000, ActualCost: 6000000, PaidAmount: 3000000, Remaining: 3000000, Status: "DP", Notes: "Bunga segar kombinasi artificial premium"},
			{UserID: uid, Category: "📸 Fotografi & Videografi", Name: "Paket Dokumentasi Foto + Cinematic Video Hari-H", EstimatedCost: 4000000, ActualCost: 4000000, PaidAmount: 2000000, Remaining: 2000000, Status: "DP", Notes: "2 fotografer, 1 videografer, drone aerial"},
			{UserID: uid, Category: "👰 Busana Pengantin", Name: "Sewa Busana Akad & Resepsi (Pria & Wanita)", EstimatedCost: 3000000, ActualCost: 3000000, PaidAmount: 1500000, Remaining: 1500000, Status: "DP", Notes: "Termasuk aksesoris lengkap & sepatu"},
			{UserID: uid, Category: "💄 Rias & Hair Do", Name: "Make Up Artist Pengantin & Orang Tua", EstimatedCost: 2500000, ActualCost: 2500000, PaidAmount: 1000000, Remaining: 1500000, Status: "DP", Notes: "Paket MUA profesional tahan luntur"},
			{UserID: uid, Category: "✉️ Undangan & Souvenir", Name: "Website Undangan + 200 Souvenir Pouch Custom", EstimatedCost: 1500000, ActualCost: 1400000, PaidAmount: 1400000, Remaining: 0, Status: "Lunas", Notes: "Souvenir elegan dengan kemasan mika"},
			{UserID: uid, Category: "🎶 Musik / Hiburan", Name: "Akustik Band 3 Personel & Sound System Venue", EstimatedCost: 2000000, ActualCost: 2000000, PaidAmount: 1000000, Remaining: 1000000, Status: "DP", Notes: "Keyboardist, vokalis, gitaris akustik"},
			{UserID: uid, Category: "🎤 MC & Among Tamu", Name: "Master of Ceremony (MC) Akad & Resepsi", EstimatedCost: 1000000, ActualCost: 1000000, PaidAmount: 500000, Remaining: 500000, Status: "DP", Notes: "MC komunikatif bilingual"},
			{UserID: uid, Category: "📄 Dokumen & Administrasi", Name: "Biaya Nikah KUA & Legalitas Administrasi", EstimatedCost: 600000, ActualCost: 600000, PaidAmount: 600000, Remaining: 0, Status: "Lunas", Notes: "Transfer PNBP KUA resmi"},
			{UserID: uid, Category: "💍 Cincin Pernikahan", Name: "Sepasang Cincin Kawin Emas & Palladium", EstimatedCost: 4000000, ActualCost: 4000000, PaidAmount: 4000000, Remaining: 0, Status: "Lunas", Notes: "Grafir nama"},
		}
		db.Create(&initialBudget)
	}

	// Seed Savings for pengantin user
	var savingsCount int64
	db.Model(&models.SavingsRecord{}).Where("user_id = ?", uid).Count(&savingsCount)
	if savingsCount == 0 {
		initialSavings := []models.SavingsRecord{
			{UserID: uid, MonthNumber: 1, MonthYear: "Mei 2026", TargetAmount: 4000000, GroomSaved: 2500000, BrideSaved: 2000000, TotalSaved: 4500000, Status: "Tercapai", Notes: "Awal komitmen tabungan bersama"},
			{UserID: uid, MonthNumber: 2, MonthYear: "Juni 2026", TargetAmount: 4000000, GroomSaved: 2500000, BrideSaved: 2000000, TotalSaved: 4500000, Status: "Tercapai", Notes: "Tabungan rutin bulan ke-2"},
			{UserID: uid, MonthNumber: 3, MonthYear: "Juli 2026", TargetAmount: 4000000, GroomSaved: 3000000, BrideSaved: 2000000, TotalSaved: 5000000, Status: "Tercapai", Notes: "Bonus kerja dialokasikan"},
			{UserID: uid, MonthNumber: 4, MonthYear: "Agustus 2026", TargetAmount: 4000000, GroomSaved: 2500000, BrideSaved: 2000000, TotalSaved: 4500000, Status: "Tercapai", Notes: "Uang muka venue disetor"},
			{UserID: uid, MonthNumber: 5, MonthYear: "September 2026", TargetAmount: 4000000, GroomSaved: 2000000, BrideSaved: 2000000, TotalSaved: 4000000, Status: "Tercapai", Notes: "Pelunasan cicilan cincin"},
			{UserID: uid, MonthNumber: 6, MonthYear: "Oktober 2026", TargetAmount: 4000000, GroomSaved: 2000000, BrideSaved: 1500000, TotalSaved: 3500000, Status: "Proses", Notes: "Target bulan berjalan"},
		}
		db.Create(&initialSavings)
	}

	// Seed Vendors for pengantin user
	var vendorCount int64
	db.Model(&models.Vendor{}).Where("user_id = ?", uid).Count(&vendorCount)
	if vendorCount == 0 {
		initialVendors := []models.Vendor{
			{UserID: uid, Category: "Venue / Gedung", Name: "Sasana Kriya Ballroom", Contact: "0812-3456-7890", DealPrice: 15000000, PaidAmount: 7500000, Remaining: 7500000, Status: "DP", Notes: "PIC: Ibu Ratna"},
			{UserID: uid, Category: "Katering", Name: "Berkah Catering Nusantara", Contact: "0813-8888-9999", DealPrice: 16000000, PaidAmount: 5000000, Remaining: 11000000, Status: "DP", Notes: "Paket 500 porsi + 3 stall"},
			{UserID: uid, Category: "Dekorasi & Bunga", Name: "Flora Wedding Decoration", Contact: "0819-0123-4567", DealPrice: 6000000, PaidAmount: 3000000, Remaining: 3000000, Status: "DP", Notes: "Tema Champagne Gold & Fresh Flowers"},
			{UserID: uid, Category: "Fotografi & Video", Name: "Lensa Cerita Photo", Contact: "0857-7788-9900", DealPrice: 4000000, PaidAmount: 2000000, Remaining: 2000000, Status: "DP", Notes: "Full day coverage, teaser 1 min"},
			{UserID: uid, Category: "Make Up & Busana", Name: "Anggun MUA & Attire", Contact: "0878-1122-3344", DealPrice: 5500000, PaidAmount: 2500000, Remaining: 3000000, Status: "DP", Notes: "Make up akad + resepsi, busana sepasang"},
			{UserID: uid, Category: "Musik & Sound", Name: "Harmony Acoustic Entertainment", Contact: "0811-9988-7766", DealPrice: 2000000, PaidAmount: 1000000, Remaining: 1000000, Status: "DP", Notes: "Trio band akustik"},
			{UserID: uid, Category: "MC & Host", Name: "Fajar MC Profesional", Contact: "0821-4455-6677", DealPrice: 1000000, PaidAmount: 500000, Remaining: 500000, Status: "DP", Notes: "MC adat & nasional"},
		}
		db.Create(&initialVendors)
	}

	// Seed Tables for pengantin user
	var tableCount int64
	db.Model(&models.SeatingTable{}).Where("user_id = ?", uid).Count(&tableCount)
	if tableCount == 0 {
		for i := 1; i <= 15; i++ {
			tableName := fmt.Sprintf("Meja %d", i)
			notes := "Tamu Reguler"
			if i == 1 {
				tableName = "Meja VIP 1 - Keluarga Inti Pria"
				notes = "Khusus Orang Tua & Keluarga Mempelai Pria"
			} else if i == 2 {
				tableName = "Meja VIP 2 - Keluarga Inti Wanita"
				notes = "Khusus Orang Tua & Keluarga Mempelai Wanita"
			} else if i == 3 {
				tableName = "Meja VIP 3 - Tamu Kehormatan"
				notes = "Atasan kantor & Tokoh Masyarakat"
			} else if i <= 6 {
				tableName = fmt.Sprintf("Meja %d - Sahabat & Rekan Kampus", i)
			}
			table := models.SeatingTable{
				UserID:      uid,
				TableNumber: fmt.Sprintf("Meja %d", i),
				TableName:   tableName,
				Capacity:    8,
				Notes:       notes,
			}
			db.Create(&table)
		}
	}

	// Seed Guests for pengantin user
	var guestCount int64
	db.Model(&models.Guest{}).Where("user_id = ?", uid).Count(&guestCount)
	if guestCount == 0 {
		initialGuests := []models.Guest{
			{UserID: uid, Name: "Bpk. Hendra & Keluarga", Category: "Pihak Pria", Phone: "081234567801", Pax: 2, RSVPStatus: "Hadir", TableNumber: "Meja 1", SouvenirGiven: false, Notes: "Paman mempelai pria"},
			{UserID: uid, Name: "Ibu Nuraini & Pendamping", Category: "Pihak Wanita", Phone: "081234567802", Pax: 2, RSVPStatus: "Hadir", TableNumber: "Meja 2", SouvenirGiven: false, Notes: "Bibi mempelai wanita"},
			{UserID: uid, Name: "Bpk. Direktur Ahmad Santoso", Category: "VIP", Phone: "081234567803", Pax: 2, RSVPStatus: "Hadir", TableNumber: "Meja 3", SouvenirGiven: false, Notes: "Pimpinan kantor mempelai pria"},
			{UserID: uid, Name: "Dimas Arya, S.Kom", Category: "Teman", Phone: "081234567804", Pax: 1, RSVPStatus: "Hadir", TableNumber: "Meja 4", SouvenirGiven: false, Notes: "Sahabat satu kampus"},
			{UserID: uid, Name: "Siti Rahmawati", Category: "Teman", Phone: "081234567805", Pax: 1, RSVPStatus: "Hadir", TableNumber: "Meja 4", SouvenirGiven: false, Notes: "Teman SMA mempelai wanita"},
			{UserID: uid, Name: "dr. Kevin Pratama & Istri", Category: "Kolega", Phone: "081234567806", Pax: 2, RSVPStatus: "Belum Konfirmasi", TableNumber: "Meja 5", SouvenirGiven: false, Notes: "Rekan kerja"},
			{UserID: uid, Name: "Rian Hidayat", Category: "Pihak Pria", Phone: "081234567807", Pax: 1, RSVPStatus: "Belum Konfirmasi", TableNumber: "Meja 6", SouvenirGiven: false, Notes: "Sepupu"},
			{UserID: uid, Name: "Anisa Putri", Category: "Pihak Wanita", Phone: "081234567808", Pax: 1, RSVPStatus: "Tidak Hadir", TableNumber: "-", SouvenirGiven: false, Notes: "Tugas dinas ke luar kota"},
		}
		db.Create(&initialGuests)
	}

	// Seed Bridal Party for pengantin user
	var partyCount int64
	db.Model(&models.BridalPartyMember{}).Where("user_id = ?", uid).Count(&partyCount)
	if partyCount == 0 {
		initialParty := []models.BridalPartyMember{
			{UserID: uid, Role: "Maid of Honor", Name: "Citra Kirana", Phone: "0812-9999-0001", MainTask: "Mendampingi mempelai wanita, cek kesiapan gaun & buket", OutfitSize: "M", Notes: "Sahabat terdekat wanita"},
			{UserID: uid, Role: "Best Man", Name: "Bayu Perkasa", Phone: "0812-9999-0002", MainTask: "Menjaga cincin kawin & mendampingi mempelai pria", OutfitSize: "L", Notes: "Sahabat terdekat pria"},
			{UserID: uid, Role: "Bridesmaid 1", Name: "Nadia Safira", Phone: "0812-9999-0003", MainTask: "Membantu koordinasi foto & memegang perlengkapan touch up", OutfitSize: "S", Notes: "Seragam Peach Terracotta"},
			{UserID: uid, Role: "Bridesmaid 2", Name: "Tania Aurelia", Phone: "0812-9999-0004", MainTask: "Membantu pembagian souvenir VIP & buket bunga", OutfitSize: "M", Notes: "Seragam Peach Terracotta"},
			{UserID: uid, Role: "Bridesmaid 3", Name: "Alina Zahra", Phone: "0812-9999-0005", MainTask: "Mendampingi prosesi kirab & membantu tamu", OutfitSize: "M", Notes: "Seragam Peach Terracotta"},
			{UserID: uid, Role: "Groomsman 1", Name: "Faisal Ramadhan", Phone: "0812-9999-0006", MainTask: "Membantu transportasi keluarga & mendampingi groomsmen", OutfitSize: "L", Notes: "Jas Charcoal & Dasi Peach"},
			{UserID: uid, Role: "Groomsman 2", Name: "Gilang Pratama", Phone: "0812-9999-0007", MainTask: "Mengarahkan mobilisasi tamu pria & seserahan", OutfitSize: "XL", Notes: "Jas Charcoal & Dasi Peach"},
			{UserID: uid, Role: "Groomsman 3", Name: "Doni Setiawan", Phone: "0812-9999-0008", MainTask: "Membantu koordinasi sound & dokumentasi keluarga", OutfitSize: "L", Notes: "Jas Charcoal & Dasi Peach"},
			{UserID: uid, Role: "Among Tamu 1", Name: "Bpk. Sutrisno", Phone: "0812-9999-0009", MainTask: "Menyambut tamu di pintu masuk resepsi", OutfitSize: "XL", Notes: "Beskap Adat Lengkap"},
			{UserID: uid, Role: "Among Tamu 2", Name: "Ibu Sulastri", Phone: "0812-9999-0010", MainTask: "Menyambut tamu & mengarahkan ke meja penerima tamu", OutfitSize: "L", Notes: "Kebaya Adat Lengkap"},
			{UserID: uid, Role: "Among Tamu 3", Name: "Bpk. Joko", Phone: "0812-9999-0011", MainTask: "Mengarahkan tamu kehormatan ke area VIP", OutfitSize: "L", Notes: "Beskap Adat Lengkap"},
			{UserID: uid, Role: "Among Tamu 4", Name: "Ibu Sri Wahyuni", Phone: "0812-9999-0012", MainTask: "Mengarahkan tamu ke pelaminan untuk ucapan selamat", OutfitSize: "M", Notes: "Kebaya Adat Lengkap"},
		}
		db.Create(&initialParty)
	}

	log.Printf("[DB] ✅ Data pernikahan untuk user 'pengantin' berhasil dimuat!")
}
