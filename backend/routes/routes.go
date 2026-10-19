package routes

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"wedding-planner-api/handlers"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Setup CORS for React frontend (Vite runs on localhost:5173 / localhost:3000)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api")
	{
		// Authentication (Public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
			auth.POST("/logout", handlers.Logout)
			auth.GET("/me", handlers.GetMe)
		}

		// Protected Routes (Require JWT & Isolated by UserID)
		protected := api.Group("")
		protected.Use(handlers.AuthMiddleware())
		{
			// Profile
			protected.GET("/profile", handlers.GetProfile)
			protected.PUT("/profile", handlers.UpdateProfile)

			// Dashboard Summary
			protected.GET("/dashboard", handlers.GetDashboardSummary)

			// Savings (Tabungan Pernikahan)
			protected.GET("/savings", handlers.GetSavings)
			protected.POST("/savings", handlers.CreateSavings)
			protected.PUT("/savings/:id", handlers.UpdateSavings)
			protected.DELETE("/savings/:id", handlers.DeleteSavings)

			// Budget & Expenses (Anggaran)
			protected.GET("/budget", handlers.GetBudget)
			protected.POST("/budget", handlers.CreateBudget)
			protected.PUT("/budget/:id", handlers.UpdateBudget)
			protected.DELETE("/budget/:id", handlers.DeleteBudget)

			// Checklist (Checklist Persiapan)
			protected.GET("/checklist", handlers.GetChecklist)
			protected.POST("/checklist", handlers.CreateChecklist)
			protected.PUT("/checklist/:id", handlers.UpdateChecklist)
			protected.PATCH("/checklist/:id/toggle", handlers.ToggleChecklist)
			protected.DELETE("/checklist/:id", handlers.DeleteChecklist)

			// Rundown (Susunan Acara Hari-H)
			protected.GET("/rundown", handlers.GetRundown)
			protected.POST("/rundown", handlers.CreateRundown)
			protected.PUT("/rundown/:id", handlers.UpdateRundown)
			protected.DELETE("/rundown/:id", handlers.DeleteRundown)

			// Guests (Daftar Tamu)
			protected.GET("/guests", handlers.GetGuests)
			protected.POST("/guests", handlers.CreateGuest)
			protected.PUT("/guests/:id", handlers.UpdateGuest)
			protected.PATCH("/guests/:id/souvenir", handlers.ToggleSouvenir)
			protected.DELETE("/guests/:id", handlers.DeleteGuest)

			// Vendors (Daftar Vendor)
			protected.GET("/vendors", handlers.GetVendors)
			protected.POST("/vendors", handlers.CreateVendor)
			protected.PUT("/vendors/:id", handlers.UpdateVendor)
			protected.DELETE("/vendors/:id", handlers.DeleteVendor)

			// Tables (Denah Meja)
			protected.GET("/tables", handlers.GetTables)
			protected.POST("/tables", handlers.CreateTable)
			protected.PUT("/tables/:id", handlers.UpdateTable)
			protected.DELETE("/tables/:id", handlers.DeleteTable)

			// Bridal Party (Pendamping Pengantin & Panitia)
			protected.GET("/bridal-party", handlers.GetBridalParty)
			protected.POST("/bridal-party", handlers.CreateBridalParty)
			protected.PUT("/bridal-party/:id", handlers.UpdateBridalParty)
			protected.DELETE("/bridal-party/:id", handlers.DeleteBridalParty)
		}
	}

	return r
}
