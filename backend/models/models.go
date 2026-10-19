package models

import "time"

type WeddingProfile struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `gorm:"index" json:"user_id"`
	BrideName     string    `gorm:"size:255;default:''" json:"bride_name"`
	GroomName     string    `gorm:"size:255;default:''" json:"groom_name"`
	WeddingDate   string    `gorm:"size:50;default:''" json:"wedding_date"`
	Location      string    `gorm:"size:255;default:''" json:"location"`
	TotalBudget   float64   `gorm:"default:0" json:"total_budget"`
	TargetSavings float64   `gorm:"default:0" json:"target_savings"`
	Notes         string    `gorm:"type:text" json:"notes"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type SavingsRecord struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	UserID       uint      `gorm:"index" json:"user_id"`
	MonthNumber  int       `json:"month_number"`
	MonthYear    string    `gorm:"size:100;not null" json:"month_year"`
	TargetAmount float64   `gorm:"default:0" json:"target_amount"`
	GroomSaved   float64   `gorm:"default:0" json:"groom_saved"`
	BrideSaved   float64   `gorm:"default:0" json:"bride_saved"`
	TotalSaved   float64   `gorm:"default:0" json:"total_saved"`
	Status       string    `gorm:"size:50;default:'Belum'" json:"status"`
	Notes        string    `gorm:"type:text" json:"notes"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type BudgetItem struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `gorm:"index" json:"user_id"`
	Category      string    `gorm:"size:100;not null" json:"category"`
	Name          string    `gorm:"size:255;not null" json:"name"`
	EstimatedCost float64   `gorm:"default:0" json:"estimated_cost"`
	ActualCost    float64   `gorm:"default:0" json:"actual_cost"`
	PaidAmount    float64   `gorm:"default:0" json:"paid_amount"`
	Remaining     float64   `gorm:"default:0" json:"remaining"`
	Status        string    `gorm:"size:50;default:'Belum Bayar'" json:"status"`
	Notes         string    `gorm:"type:text" json:"notes"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type ChecklistItem struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"index" json:"user_id"`
	Phase       string    `gorm:"size:100;not null" json:"phase"`
	Task        string    `gorm:"size:255;not null" json:"task"`
	PIC         string    `gorm:"size:100" json:"pic"`
	IsCompleted bool      `gorm:"default:false" json:"is_completed"`
	DueDate     string    `gorm:"size:50" json:"due_date"`
	Notes       string    `gorm:"type:text" json:"notes"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type RundownItem struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"index" json:"user_id"`
	Time       string    `gorm:"size:50;not null" json:"time"`
	Activity   string    `gorm:"size:255;not null" json:"activity"`
	PIC        string    `gorm:"size:100" json:"pic"`
	Location   string    `gorm:"size:150" json:"location"`
	Notes      string    `gorm:"type:text" json:"notes"`
	OrderIndex int       `gorm:"default:0" json:"order_index"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type Guest struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uint      `gorm:"index" json:"user_id"`
	Name          string    `gorm:"size:255;not null" json:"name"`
	Category      string    `gorm:"size:100;default:'Pihak Pria'" json:"category"`
	Phone         string    `gorm:"size:50" json:"phone"`
	Pax           int       `gorm:"default:1" json:"pax"`
	RSVPStatus    string    `gorm:"size:50;default:'Belum Konfirmasi'" json:"rsvp_status"`
	TableNumber   string    `gorm:"size:50" json:"table_number"`
	SouvenirGiven bool      `gorm:"default:false" json:"souvenir_given"`
	GiftAmount    float64   `gorm:"default:0" json:"gift_amount"`
	Notes         string    `gorm:"type:text" json:"notes"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type Vendor struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"index" json:"user_id"`
	Category   string    `gorm:"size:100;not null" json:"category"`
	Name       string    `gorm:"size:255;not null" json:"name"`
	Contact    string    `gorm:"size:100" json:"contact"`
	DealPrice  float64   `gorm:"default:0" json:"deal_price"`
	PaidAmount float64   `gorm:"default:0" json:"paid_amount"`
	Remaining  float64   `gorm:"default:0" json:"remaining"`
	Status     string    `gorm:"size:50;default:'Belum Booking'" json:"status"`
	Notes      string    `gorm:"type:text" json:"notes"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type SeatingTable struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"index" json:"user_id"`
	TableNumber string    `gorm:"size:50;not null" json:"table_number"`
	TableName   string    `gorm:"size:150" json:"table_name"`
	Capacity    int       `gorm:"default:8" json:"capacity"`
	Notes       string    `gorm:"type:text" json:"notes"`
	Guests      []Guest   `gorm:"-" json:"guests,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type BridalPartyMember struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"index" json:"user_id"`
	Role       string    `gorm:"size:100;not null" json:"role"`
	Name       string    `gorm:"size:255;not null" json:"name"`
	Phone      string    `gorm:"size:50" json:"phone"`
	MainTask   string    `gorm:"type:text" json:"main_task"`
	OutfitSize string    `gorm:"size:20" json:"outfit_size"`
	Notes      string    `gorm:"type:text" json:"notes"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type DashboardSummary struct {
	Profile       WeddingProfile    `json:"profile"`
	DaysRemaining int               `json:"days_remaining"`
	Budget        BudgetSummary     `json:"budget"`
	Guests        GuestSummary      `json:"guests"`
	Checklist     ChecklistSummary  `json:"checklist"`
	Savings       SavingsSummary    `json:"savings"`
	VendorsCount  int64             `json:"vendors_count"`
	RecentTasks   []ChecklistItem   `json:"recent_tasks"`
	TodayRundown  []RundownItem     `json:"today_rundown"`
}

type BudgetSummary struct {
	TotalBudget   float64            `json:"total_budget"`
	EstimatedCost float64            `json:"estimated_cost"`
	PaidAmount    float64            `json:"paid_amount"`
	Remaining     float64            `json:"remaining"`
	ByCategory    map[string]float64 `json:"by_category"`
}

type GuestSummary struct {
	TotalInvited    int64 `json:"total_invited"`
	TotalPax        int64 `json:"total_pax"`
	AttendingPax    int64 `json:"attending_pax"`
	DeclinedPax     int64 `json:"declined_pax"`
	PendingPax      int64 `json:"pending_pax"`
	SouvenirsGiven  int64 `json:"souvenirs_given"`
}

type ChecklistSummary struct {
	TotalTasks     int64   `json:"total_tasks"`
	CompletedTasks int64   `json:"completed_tasks"`
	Percentage     float64 `json:"percentage"`
}

type SavingsSummary struct {
	TargetTotal    float64 `json:"target_total"`
	TotalCollected float64 `json:"total_collected"`
	Remaining      float64 `json:"remaining"`
	Percentage     float64 `json:"percentage"`
}

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `gorm:"size:100;uniqueIndex;not null" json:"username"`
	Name         string    `gorm:"size:255;not null" json:"name"`
	Role         string    `gorm:"size:50;default:'pengantin'" json:"role"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Name     string `json:"name" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}


