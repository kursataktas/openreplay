package main

import (
	"log"
	"openreplay/backend/internal/builder"
	"openreplay/backend/internal/config/ender"
	"openreplay/backend/internal/handlers"
	"openreplay/backend/internal/handlers/custom"
	"openreplay/backend/internal/handlers/ios"
	"openreplay/backend/internal/handlers/web"
	"openreplay/backend/pkg/intervals"
	logger "openreplay/backend/pkg/log"
	"openreplay/backend/pkg/messages"
	"openreplay/backend/pkg/queue"
	"openreplay/backend/pkg/queue/types"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	log.SetFlags(log.LstdFlags | log.LUTC | log.Llongfile)

	// Load service configuration
	cfg := ender.New()

	// Declare message handlers we want to apply for each incoming message
	msgHandlers := []handlers.MessageProcessor{
		// web handlers
		&web.ClickRageDetector{},
		&web.CpuIssueDetector{},
		&web.DeadClickDetector{},
		&web.MemoryIssueDetector{},
		&web.PerformanceAggregator{},
		// iOS handlers
		&ios.AppNotResponding{},
		&ios.ClickRageDetector{},
		&ios.PerformanceAggregator{},
		// Other handlers (you can add your custom handlers here)
		&custom.CustomHandler{},
	}

	// Create handler's aggregator
	builderMap := builder.NewBuilderMap(msgHandlers...)

	// Init logger
	statsLogger := logger.NewQueueStats(cfg.LoggerTimeout)

	// Init producer and consumer for data bus
	producer := queue.NewProducer()
	consumer := queue.NewMessageConsumer(
		cfg.GroupEvents,
		[]string{
			cfg.TopicRawWeb,
			cfg.TopicRawIOS,
			cfg.TopicTrigger, // to receive SessionEnd events
		},
		func(sessionID uint64, msg messages.Message, meta *types.Meta) {
			statsLogger.Collect(sessionID, meta)
			builderMap.HandleMessage(sessionID, msg, msg.Meta().Index)
		},
		false,
	)

	log.Printf("Heuristics service started\n")

	sigchan := make(chan os.Signal, 1)
	signal.Notify(sigchan, syscall.SIGINT, syscall.SIGTERM)

	tick := time.Tick(intervals.EVENTS_COMMIT_INTERVAL * time.Millisecond)
	for {
		select {
		case sig := <-sigchan:
			log.Printf("Caught signal %v: terminating\n", sig)
			producer.Close(cfg.ProducerTimeout)
			consumer.Commit()
			consumer.Close()
			os.Exit(0)
		case <-tick:
			builderMap.IterateReadyMessages(func(sessionID uint64, readyMsg messages.Message) {
				producer.Produce(cfg.TopicTrigger, sessionID, messages.Encode(readyMsg))
			})
			producer.Flush(cfg.ProducerTimeout)
			consumer.Commit()
		default:
			if err := consumer.ConsumeNext(); err != nil {
				log.Fatalf("Error on consuming: %v", err)
			}
		}
	}
}
