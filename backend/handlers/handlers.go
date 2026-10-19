package handlers

import (
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"wedding-planner-api/database"
	"wedding-planner-api/models"
)

// Helper: respond JSON error
func respondError(c *gin.Context, status int, msg string) {
	c.JSON(status, gin.H{"error": msg})
}

// Helper: get current authenticated user ID
func getUserID(c *gin.Context) uint {
	val, exists := c.Get("userId")
	if exists {
		if id, ok := val.(uint); ok {
			return id
		}
	}

	authHeader := c.GetHeader("Authorization")
	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			claims := &Claims{}
			token, err := jwt.ParseWithClaims(parts[1], claims, func(token *jwt.Token) (interface{}, error) {
				return jwtSecret, nil
			})
			if err == nil && token.Valid {
				return claims.UserID
			}
		}
	}
	return 0
}

// ==================== WEDDING PROFILE ====================

func GetProfile(c *gin.Context) {
	userID := getUserID(c)
	var profile models.WeddingProfile
	if err := database.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		// Create blank profile for this user if none exists
		profile = models.WeddingProfile{
			UserID:        userID,
			BrideName:     "",
			GroomName:     "",
			WeddingDate:   "",
			Location:      "",
			TotalBudget:   0,
			TargetSavings: 0,
			Notes:         "",
			UpdatedAt:     time.Now(),
		}
		database.DB.Create(&profile)
	}
	c.JSON(http.StatusOK, profile)
}

func UpdateProfile(c *gin.Context) {
	userID := getUserID(c)
	var profile models.WeddingProfile
	if err := database.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		// Create if not found
		if err := c.ShouldBindJSON(&profile); err != nil {
			respondError(c, http.StatusBadRequest, err.Error())
			return
		}
		profile.UserID = userID
		profile.UpdatedAt = time.Now()
		database.DB.Create(&profile)
		c.JSON(http.StatusOK, profile)
		return
	}

	var req models.WeddingProfile
	if err := c.ShouldBindJSON(&req); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}

	profile.BrideName = req.BrideName
	profile.GroomName = req.GroomName
	profile.WeddingDate = req.WeddingDate
	profile.Location = req.Location
	profile.TotalBudget = req.TotalBudget
	profile.TargetSavings = req.TargetSavings
	profile.Notes = req.Notes
	profile.UpdatedAt = time.Now()

	database.DB.Save(&profile)
	c.JSON(http.StatusOK, profile)
}

// ==================== DASHBOARD SUMMARY ====================

func GetDashboardSummary(c *gin.Context) {
	userID := getUserID(c)

	var profile models.WeddingProfile
	database.DB.Where("user_id = ?", userID).First(&profile)

	// Calculate days remaining
	daysRemaining := 0
	if profile.WeddingDate != "" {
		if t, err := time.Parse("2006-01-02", profile.WeddingDate); err == nil {
			diff := time.Until(t)
			daysRemaining = int(math.Ceil(diff.Hours() / 24))
			if daysRemaining < 0 {
				daysRemaining = 0
			}
		}
	}

	// Budget stats
	var budgetItems []models.BudgetItem
	database.DB.Where("user_id = ?", userID).Find(&budgetItems)
	var estTotal, paidTotal float64
	byCat := make(map[string]float64)
	for _, item := range budgetItems {
		estTotal += item.EstimatedCost
		paidTotal += item.PaidAmount
		byCat[item.Category] += item.EstimatedCost
	}
	budgetRem := profile.TotalBudget - estTotal
	if budgetRem < 0 {
		budgetRem = 0
	}

	// Guest stats
	var guests []models.Guest
	database.DB.Where("user_id = ?", userID).Find(&guests)
	var totalPax, attendingPax, declinedPax, pendingPax, souvenirsGiven int64
	for _, g := range guests {
		totalPax += int64(g.Pax)
		if g.RSVPStatus == "Hadir" {
			attendingPax += int64(g.Pax)
		} else if g.RSVPStatus == "Tidak Hadir" {
			declinedPax += int64(g.Pax)
		} else {
			pendingPax += int64(g.Pax)
		}
		if g.SouvenirGiven {
			souvenirsGiven++
		}
	}

	// Checklist stats
	var totalTasks, completedTasks int64
	database.DB.Model(&models.ChecklistItem{}).Where("user_id = ?", userID).Count(&totalTasks)
	database.DB.Model(&models.ChecklistItem{}).Where("user_id = ? AND is_completed = ?", userID, true).Count(&completedTasks)
	taskPct := 0.0
	if totalTasks > 0 {
		taskPct = math.Round((float64(completedTasks) / float64(totalTasks)) * 100)
	}

	// Savings stats
	var savings []models.SavingsRecord
	database.DB.Where("user_id = ?", userID).Find(&savings)
	var totalSaved float64
	for _, s := range savings {
		totalSaved += s.TotalSaved
	}
	savingsRem := profile.TargetSavings - totalSaved
	if savingsRem < 0 {
		savingsRem = 0
	}
	savingsPct := 0.0
	if profile.TargetSavings > 0 {
		savingsPct = math.Round((totalSaved / profile.TargetSavings) * 100)
	}

	// Vendors count
	var vendorsCount int64
	database.DB.Model(&models.Vendor{}).Where("user_id = ?", userID).Count(&vendorsCount)

	// Upcoming Checklist (uncompleted)
	var recentTasks []models.ChecklistItem
	database.DB.Where("user_id = ? AND is_completed = ?", userID, false).Limit(5).Find(&recentTasks)

	// Today Rundown sample
	var rundown []models.RundownItem
	database.DB.Where("user_id = ?", userID).Order("order_index asc").Limit(6).Find(&rundown)

	summary := models.DashboardSummary{
		Profile:       profile,
		DaysRemaining: daysRemaining,
		Budget: models.BudgetSummary{
			TotalBudget:   profile.TotalBudget,
			EstimatedCost: estTotal,
			PaidAmount:    paidTotal,
			Remaining:     budgetRem,
			ByCategory:    byCat,
		},
		Guests: models.GuestSummary{
			TotalInvited:   int64(len(guests)),
			TotalPax:       totalPax,
			AttendingPax:   attendingPax,
			DeclinedPax:    declinedPax,
			PendingPax:     pendingPax,
			SouvenirsGiven: souvenirsGiven,
		},
		Checklist: models.ChecklistSummary{
			TotalTasks:     totalTasks,
			CompletedTasks: completedTasks,
			Percentage:     taskPct,
		},
		Savings: models.SavingsSummary{
			TargetTotal:    profile.TargetSavings,
			TotalCollected: totalSaved,
			Remaining:      savingsRem,
			Percentage:     savingsPct,
		},
		VendorsCount: vendorsCount,
		RecentTasks:  recentTasks,
		TodayRundown: rundown,
	}

	c.JSON(http.StatusOK, summary)
}

// ==================== TABUNGAN PERNIKAHAN ====================

func GetSavings(c *gin.Context) {
	userID := getUserID(c)
	var records []models.SavingsRecord
	database.DB.Where("user_id = ?", userID).Order("month_number asc, id asc").Find(&records)
	c.JSON(http.StatusOK, records)
}

func CreateSavings(c *gin.Context) {
	userID := getUserID(c)
	var item models.SavingsRecord
	if err := c.ShouldBindJSON(&item); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	item.UserID = userID
	item.TotalSaved = item.GroomSaved + item.BrideSaved
	if item.TotalSaved >= item.TargetAmount && item.TargetAmount > 0 {
		item.Status = "Tercapai"
	}
	item.CreatedAt = time.Now()
	item.UpdatedAt = time.Now()
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, item)
}

func UpdateSavings(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	var item models.SavingsRecord
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		respondError(c, http.StatusNotFound, "Data tabungan tidak ditemukan")
		return
	}
	if err := c.ShouldBindJSON(&item); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	item.UserID = userID
	item.TotalSaved = item.GroomSaved + item.BrideSaved
	if item.TotalSaved >= item.TargetAmount && item.TargetAmount > 0 {
		item.Status = "Tercapai"
	} else if item.TotalSaved > 0 {
		item.Status = "Proses"
	} else {
		item.Status = "Belum"
	}
	item.UpdatedAt = time.Now()
	database.DB.Save(&item)
	c.JSON(http.StatusOK, item)
}

func DeleteSavings(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.SavingsRecord{}).Error; err != nil {
		respondError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Data tabungan berhasil dihapus"})
}

// ==================== ANGGARAN & PENGELUARAN ====================

func GetBudget(c *gin.Context) {
	userID := getUserID(c)
	var items []models.BudgetItem
	category := c.Query("category")
	query := database.DB.Where("user_id = ?", userID).Order("category asc, id asc")
	if category != "" {
		query = query.Where("category = ?", category)
	}
	query.Find(&items)
	c.JSON(http.StatusOK, items)
}

func CreateBudget(c *gin.Context) {
	userID := getUserID(c)
	var item models.BudgetItem
	if err := c.ShouldBindJSON(&item); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	item.UserID = userID
	cost := item.EstimatedCost
	if item.ActualCost > 0 {
		cost = item.ActualCost
	}
	item.Remaining = cost - item.PaidAmount
	if item.Remaining <= 0 && item.PaidAmount > 0 {
		item.Status = "Lunas"
	} else if item.PaidAmount > 0 {
		item.Status = "DP"
	} else {
		item.Status = "Belum Bayar"
	}
	item.CreatedAt = time.Now()
	item.UpdatedAt = time.Now()
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, item)
}

func UpdateBudget(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	var item models.BudgetItem
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		respondError(c, http.StatusNotFound, "Item anggaran tidak ditemukan")
		return
	}
	if err := c.ShouldBindJSON(&item); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	item.UserID = userID
	cost := item.EstimatedCost
	if item.ActualCost > 0 {
		cost = item.ActualCost
	}
	item.Remaining = cost - item.PaidAmount
	if item.Remaining <= 0 && item.PaidAmount > 0 {
		item.Status = "Lunas"
	} else if item.PaidAmount > 0 {
		item.Status = "DP"
	} else {
		item.Status = "Belum Bayar"
	}
	item.UpdatedAt = time.Now()
	database.DB.Save(&item)
	c.JSON(http.StatusOK, item)
}

func DeleteBudget(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.BudgetItem{}).Error; err != nil {
		respondError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Item anggaran berhasil dihapus"})
}

// ==================== CHECKLIST PERSYARATAN & TUGAS ====================

func GetChecklist(c *gin.Context) {
	userID := getUserID(c)
	var items []models.ChecklistItem
	database.DB.Where("user_id = ?", userID).Order("id asc").Find(&items)
	c.JSON(http.StatusOK, items)
}

func CreateChecklist(c *gin.Context) {
	userID := getUserID(c)
	var item models.ChecklistItem
	if err := c.ShouldBindJSON(&item); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	item.UserID = userID
	item.CreatedAt = time.Now()
	item.UpdatedAt = time.Now()
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, item)
}

func UpdateChecklist(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	var item models.ChecklistItem
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		respondError(c, http.StatusNotFound, "Tugas checklist tidak ditemukan")
		return
	}
	if err := c.ShouldBindJSON(&item); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	item.UserID = userID
	item.UpdatedAt = time.Now()
	database.DB.Save(&item)
	c.JSON(http.StatusOK, item)
}

func ToggleChecklist(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	var item models.ChecklistItem
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		respondError(c, http.StatusNotFound, "Tugas checklist tidak ditemukan")
		return
	}
	item.IsCompleted = !item.IsCompleted
	item.UpdatedAt = time.Now()
	database.DB.Save(&item)
	c.JSON(http.StatusOK, item)
}

func DeleteChecklist(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.ChecklistItem{}).Error; err != nil {
		respondError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Tugas checklist berhasil dihapus"})
}

// ==================== RUNDOWN HARI-H ====================

func GetRundown(c *gin.Context) {
	userID := getUserID(c)
	var items []models.RundownItem
	database.DB.Where("user_id = ?", userID).Order("order_index asc, id asc").Find(&items)
	c.JSON(http.StatusOK, items)
}

func CreateRundown(c *gin.Context) {
	userID := getUserID(c)
	var item models.RundownItem
	if err := c.ShouldBindJSON(&item); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	item.UserID = userID
	item.CreatedAt = time.Now()
	item.UpdatedAt = time.Now()
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, item)
}

func UpdateRundown(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	var item models.RundownItem
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		respondError(c, http.StatusNotFound, "Item rundown tidak ditemukan")
		return
	}
	if err := c.ShouldBindJSON(&item); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	item.UserID = userID
	item.UpdatedAt = time.Now()
	database.DB.Save(&item)
	c.JSON(http.StatusOK, item)
}

func DeleteRundown(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.RundownItem{}).Error; err != nil {
		respondError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Item rundown berhasil dihapus"})
}

// ==================== DAFTAR TAMU ====================

func GetGuests(c *gin.Context) {
	userID := getUserID(c)
	var guests []models.Guest
	query := database.DB.Where("user_id = ?", userID).Order("name asc")
	if cat := c.Query("category"); cat != "" {
		query = query.Where("category = ?", cat)
	}
	if rsvp := c.Query("rsvp"); rsvp != "" {
		query = query.Where("rsvp_status = ?", rsvp)
	}
	if table := c.Query("table"); table != "" {
		query = query.Where("table_number = ?", table)
	}
	query.Find(&guests)
	c.JSON(http.StatusOK, guests)
}

func CreateGuest(c *gin.Context) {
	userID := getUserID(c)
	var item models.Guest
	if err := c.ShouldBindJSON(&item); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	item.UserID = userID
	if item.Pax <= 0 {
		item.Pax = 1
	}
	if item.RSVPStatus == "" {
		item.RSVPStatus = "Belum Konfirmasi"
	}
	item.CreatedAt = time.Now()
	item.UpdatedAt = time.Now()
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, item)
}

func UpdateGuest(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	var item models.Guest
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		respondError(c, http.StatusNotFound, "Data tamu tidak ditemukan")
		return
	}
	if err := c.ShouldBindJSON(&item); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	item.UserID = userID
	item.UpdatedAt = time.Now()
	database.DB.Save(&item)
	c.JSON(http.StatusOK, item)
}

func ToggleSouvenir(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	var item models.Guest
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		respondError(c, http.StatusNotFound, "Data tamu tidak ditemukan")
		return
	}
	item.SouvenirGiven = !item.SouvenirGiven
	item.UpdatedAt = time.Now()
	database.DB.Save(&item)
	c.JSON(http.StatusOK, item)
}

func DeleteGuest(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Guest{}).Error; err != nil {
		respondError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Data tamu berhasil dihapus"})
}

// ==================== DAFTAR VENDOR ====================

func GetVendors(c *gin.Context) {
	userID := getUserID(c)
	var vendors []models.Vendor
	query := database.DB.Where("user_id = ?", userID).Order("category asc, id asc")
	if cat := c.Query("category"); cat != "" {
		query = query.Where("category = ?", cat)
	}
	query.Find(&vendors)
	c.JSON(http.StatusOK, vendors)
}

func CreateVendor(c *gin.Context) {
	userID := getUserID(c)
	var item models.Vendor
	if err := c.ShouldBindJSON(&item); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	item.UserID = userID
	item.Remaining = item.DealPrice - item.PaidAmount
	if item.Remaining <= 0 && item.PaidAmount > 0 {
		item.Status = "Lunas"
	}
	item.CreatedAt = time.Now()
	item.UpdatedAt = time.Now()
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, item)
}

func UpdateVendor(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	var item models.Vendor
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		respondError(c, http.StatusNotFound, "Vendor tidak ditemukan")
		return
	}
	if err := c.ShouldBindJSON(&item); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	item.UserID = userID
	item.Remaining = item.DealPrice - item.PaidAmount
	if item.Remaining <= 0 && item.PaidAmount > 0 {
		item.Status = "Lunas"
	}
	item.UpdatedAt = time.Now()
	database.DB.Save(&item)
	c.JSON(http.StatusOK, item)
}

func DeleteVendor(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Vendor{}).Error; err != nil {
		respondError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Vendor berhasil dihapus"})
}

// ==================== DENAH MEJA ====================

func GetTables(c *gin.Context) {
	userID := getUserID(c)
	var tables []models.SeatingTable
	database.DB.Where("user_id = ?", userID).Order("id asc").Find(&tables)

	// Fetch guests for each table
	for i := range tables {
		var guests []models.Guest
		database.DB.Where("user_id = ? AND (table_number = ? OR table_number = ?)", userID, tables[i].TableNumber, tables[i].TableName).Find(&guests)
		tables[i].Guests = guests
	}

	c.JSON(http.StatusOK, tables)
}

func CreateTable(c *gin.Context) {
	userID := getUserID(c)
	var item models.SeatingTable
	if err := c.ShouldBindJSON(&item); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	item.UserID = userID
	if item.Capacity <= 0 {
		item.Capacity = 8
	}
	item.CreatedAt = time.Now()
	item.UpdatedAt = time.Now()
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, item)
}

func UpdateTable(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	var item models.SeatingTable
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		respondError(c, http.StatusNotFound, "Meja tidak ditemukan")
		return
	}
	if err := c.ShouldBindJSON(&item); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	item.UserID = userID
	item.UpdatedAt = time.Now()
	database.DB.Save(&item)
	c.JSON(http.StatusOK, item)
}

func DeleteTable(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.SeatingTable{}).Error; err != nil {
		respondError(c, http.StatusInternalServerError, err.Error())
		return
	}
	// Clear table assignment for guests seated at this table for this user
	database.DB.Model(&models.Guest{}).Where("user_id = ? AND table_number = ?", userID, "Meja "+id).Update("table_number", "")
	c.JSON(http.StatusOK, gin.H{"message": "Meja berhasil dihapus"})
}

// ==================== PENDAMPING PENGANTIN & PANITIA ====================

func GetBridalParty(c *gin.Context) {
	userID := getUserID(c)
	var party []models.BridalPartyMember
	database.DB.Where("user_id = ?", userID).Order("id asc").Find(&party)
	c.JSON(http.StatusOK, party)
}

func CreateBridalParty(c *gin.Context) {
	userID := getUserID(c)
	var item models.BridalPartyMember
	if err := c.ShouldBindJSON(&item); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	item.UserID = userID
	item.CreatedAt = time.Now()
	item.UpdatedAt = time.Now()
	database.DB.Create(&item)
	c.JSON(http.StatusCreated, item)
}

func UpdateBridalParty(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	var item models.BridalPartyMember
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		respondError(c, http.StatusNotFound, "Anggota pendamping tidak ditemukan")
		return
	}
	if err := c.ShouldBindJSON(&item); err != nil {
		respondError(c, http.StatusBadRequest, err.Error())
		return
	}
	item.UserID = userID
	item.UpdatedAt = time.Now()
	database.DB.Save(&item)
	c.JSON(http.StatusOK, item)
}

func DeleteBridalParty(c *gin.Context) {
	userID := getUserID(c)
	id := c.Param("id")
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.BridalPartyMember{}).Error; err != nil {
		respondError(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Anggota pendamping berhasil dihapus"})
}
