package main

import (
	"context"
	"openreplay/backend/internal/http/server"
	"openreplay/backend/pkg/analytics"
	"openreplay/backend/pkg/analytics/api"
	"openreplay/backend/pkg/db/postgres/pool"
	"openreplay/backend/pkg/logger"
	"os"
	"os/signal"
	"syscall"

	config "openreplay/backend/internal/config/analytics"
)

func main() {
	ctx := context.Background()
	log := logger.New()
	cfg := config.New(log)

	pgConn, err := pool.New(cfg.Postgres.String())
	if err != nil {
		log.Fatal(ctx, "can't init postgres connection: %s", err)
	}
	defer pgConn.Close()

	services, err := analytics.NewServiceBuilder(log, cfg, pgConn)
	if err != nil {
		log.Fatal(ctx, "can't init services: %s", err)
	}

	router, err := api.NewRouter(cfg, log, services)
	if err != nil {
		log.Fatal(ctx, "failed while creating router: %s", err)
	}

	analyticsServer, err := server.New(router.GetHandler(), cfg.HTTPHost, cfg.HTTPPort, cfg.HTTPTimeout)
	if err != nil {
		log.Fatal(ctx, "failed while creating server: %s", err)
	}

	go func() {
		if err := analyticsServer.Start(); err != nil {
			log.Fatal(ctx, "http server error: %s", err)
		}
	}()

	log.Info(ctx, "server successfully started on port %s", cfg.HTTPPort)

	// Wait stop signal to shut down server gracefully
	sigchan := make(chan os.Signal, 1)
	signal.Notify(sigchan, syscall.SIGINT, syscall.SIGTERM)
	<-sigchan
	log.Info(ctx, "shutting down the server")
	analyticsServer.Stop()

}
