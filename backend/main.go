package main

import (
	"log"
	"os"

	"wedding-planner-api/database"
	"wedding-planner-api/routes"
)

func main() {
	log.Println("==================================================")
	log.Println("💍 WEDDING PLANNER API (Golang + MySQL/SQLite)")
	log.Println("   Portal Perencanaan Pernikahan Multi-Tenant")
	log.Println("==================================================")

	// Initialize Database (MySQL with SQLite automatic fallback)
	database.InitDB()

	// Initialize Router & Endpoints
	r := routes.SetupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server running on http://localhost:%s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}
