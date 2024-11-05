package main

import (
	"context"
	"openreplay/backend/pkg/server/api"
	"openreplay/backend/pkg/spot"
	api2 "openreplay/backend/pkg/spot/api"
	"os"
	"os/signal"
	"syscall"

	spotConfig "openreplay/backend/internal/config/spot"
	"openreplay/backend/pkg/db/postgres/pool"
	"openreplay/backend/pkg/logger"
	"openreplay/backend/pkg/metrics"
	databaseMetrics "openreplay/backend/pkg/metrics/database"
	spotMetrics "openreplay/backend/pkg/metrics/spot"
	"openreplay/backend/pkg/server"
)

func main() {
	ctx := context.Background()
	log := logger.New()
	cfg := spotConfig.New(log)
	metrics.New(log, append(spotMetrics.List(), databaseMetrics.List()...))

	pgConn, err := pool.New(cfg.Postgres.String())
	if err != nil {
		log.Fatal(ctx, "can't init postgres connection: %s", err)
	}
	defer pgConn.Close()

	services, err := spot.NewServiceBuilder(log, cfg, pgConn)
	if err != nil {
		log.Fatal(ctx, "can't init services: %s", err)
	}

	handlers, err := api2.NewHandlers(log, cfg, services)
	if err != nil {
		log.Fatal(ctx, "can't init handlers: %s", err)
	}

	router, err := api.NewRouter(&cfg.HTTP, log, pgConn)
	if err != nil {
		log.Fatal(ctx, "failed while creating router: %s", err)
	}
	router.AddHandlers(handlers.GetAll())

	spotServer, err := server.New(router.GetHandler(), cfg.HTTPHost, cfg.HTTPPort, cfg.HTTPTimeout)
	if err != nil {
		log.Fatal(ctx, "failed while creating server: %s", err)
	}

	go func() {
		if err := spotServer.Start(); err != nil {
			log.Fatal(ctx, "http server error: %s", err)
		}
	}()
	log.Info(ctx, "server successfully started on port %s", cfg.HTTPPort)

	// Wait stop signal to shut down server gracefully
	sigchan := make(chan os.Signal, 1)
	signal.Notify(sigchan, syscall.SIGINT, syscall.SIGTERM)
	<-sigchan
	log.Info(ctx, "shutting down the server")
	spotServer.Stop()
}
