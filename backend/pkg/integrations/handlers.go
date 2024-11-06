package data_integration

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"

	"openreplay/backend/internal/config/integrations"
	"openreplay/backend/pkg/logger"
	"openreplay/backend/pkg/server/api"
)

type handlersImpl struct {
	log           logger.Logger
	JsonSizeLimit int64
	services      *ServiceBuilder
}

func NewHandlers(log logger.Logger, cfg *integrations.Config, services *ServiceBuilder) (api.Handlers, error) {
	return &handlersImpl{
		log:           log,
		JsonSizeLimit: cfg.JsonSizeLimit,
		services:      services,
	}, nil
}

func (e *handlersImpl) GetAll() []*api.Description {
	return []*api.Description{
		{"/v1/integrations/{name}/{project}", e.createIntegration, []string{"POST", "OPTIONS"}},
		{"/v1/integrations/{name}/{project}", e.getIntegration, []string{"GET", "OPTIONS"}},
		{"/v1/integrations/{name}/{project}", e.updateIntegration, []string{"PATCH", "OPTIONS"}},
		{"/v1/integrations/{name}/{project}", e.deleteIntegration, []string{"DELETE", "OPTIONS"}},
		{"/v1/integrations/{name}/{project}/data/{session}", e.getIntegrationData, []string{"GET", "OPTIONS"}},
	}
}

func getIntegrationsArgs(r *http.Request) (string, uint64, error) {
	vars := mux.Vars(r)
	name := vars["name"]
	if name == "" {
		return "", 0, fmt.Errorf("empty integration name")
	}
	project := vars["project"]
	if project == "" {
		return "", 0, fmt.Errorf("project id is empty")
	}
	projID, err := strconv.ParseUint(project, 10, 64)
	if err != nil || projID <= 0 {
		return "", 0, fmt.Errorf("invalid project id")
	}
	return name, projID, nil
}

func getIntegrationSession(r *http.Request) (uint64, error) {
	vars := mux.Vars(r)
	session := vars["session"]
	if session == "" {
		return 0, fmt.Errorf("session id is empty")
	}
	sessID, err := strconv.ParseUint(session, 10, 64)
	if err != nil || sessID <= 0 {
		return 0, fmt.Errorf("invalid session id")
	}
	return sessID, nil
}

type IntegrationRequest struct {
	IntegrationData map[string]string `json:"data"`
}

func (e *handlersImpl) createIntegration(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
	bodySize := 0

	bodyBytes, err := api.ReadBody(e.log, w, r, e.JsonSizeLimit)
	if err != nil {
		api.ResponseWithError(e.log, r.Context(), w, http.StatusRequestEntityTooLarge, err, startTime, r.URL.Path, bodySize)
		return
	}
	bodySize = len(bodyBytes)

	integration, project, err := getIntegrationsArgs(r)
	if err != nil {
		api.ResponseWithError(e.log, r.Context(), w, http.StatusBadRequest, err, startTime, r.URL.Path, bodySize)
		return
	}

	req := &IntegrationRequest{}
	if err := json.Unmarshal(bodyBytes, req); err != nil {
		api.ResponseWithError(e.log, r.Context(), w, http.StatusBadRequest, err, startTime, r.URL.Path, bodySize)
		return
	}

	if err := e.services.Integrator.AddIntegration(project, integration, req.IntegrationData); err != nil {
		api.ResponseWithError(e.log, r.Context(), w, http.StatusInternalServerError, err, startTime, r.URL.Path, bodySize)
		return
	}
	api.ResponseOK(e.log, r.Context(), w, startTime, r.URL.Path, bodySize)
}

func (e *handlersImpl) getIntegration(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
	bodySize := 0

	integration, project, err := getIntegrationsArgs(r)
	if err != nil {
		api.ResponseWithError(e.log, r.Context(), w, http.StatusBadRequest, err, startTime, r.URL.Path, bodySize)
		return
	}

	intParams, err := e.services.Integrator.GetIntegration(project, integration)
	if err != nil {
		api.ResponseWithError(e.log, r.Context(), w, http.StatusInternalServerError, err, startTime, r.URL.Path, bodySize)
		return
	}
	api.ResponseWithJSON(e.log, r.Context(), w, intParams, startTime, r.URL.Path, bodySize)
}

func (e *handlersImpl) updateIntegration(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
	bodySize := 0

	bodyBytes, err := api.ReadBody(e.log, w, r, e.JsonSizeLimit)
	if err != nil {
		api.ResponseWithError(e.log, r.Context(), w, http.StatusRequestEntityTooLarge, err, startTime, r.URL.Path, bodySize)
		return
	}
	bodySize = len(bodyBytes)

	integration, project, err := getIntegrationsArgs(r)
	if err != nil {
		api.ResponseWithError(e.log, r.Context(), w, http.StatusBadRequest, err, startTime, r.URL.Path, bodySize)
		return
	}

	req := &IntegrationRequest{}
	if err := json.Unmarshal(bodyBytes, req); err != nil {
		api.ResponseWithError(e.log, r.Context(), w, http.StatusBadRequest, err, startTime, r.URL.Path, bodySize)
		return
	}

	if err := e.services.Integrator.UpdateIntegration(project, integration, req.IntegrationData); err != nil {
		api.ResponseWithError(e.log, r.Context(), w, http.StatusBadRequest, err, startTime, r.URL.Path, bodySize)
		return
	}
	api.ResponseOK(e.log, r.Context(), w, startTime, r.URL.Path, bodySize)
}

func (e *handlersImpl) deleteIntegration(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
	bodySize := 0

	integration, project, err := getIntegrationsArgs(r)
	if err != nil {
		api.ResponseWithError(e.log, r.Context(), w, http.StatusBadRequest, err, startTime, r.URL.Path, bodySize)
		return
	}

	if err := e.services.Integrator.DeleteIntegration(project, integration); err != nil {
		api.ResponseWithError(e.log, r.Context(), w, http.StatusInternalServerError, err, startTime, r.URL.Path, bodySize)
		return
	}
	api.ResponseOK(e.log, r.Context(), w, startTime, r.URL.Path, bodySize)
}

func (e *handlersImpl) getIntegrationData(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
	bodySize := 0

	integration, project, err := getIntegrationsArgs(r)
	if err != nil {
		api.ResponseWithError(e.log, r.Context(), w, http.StatusBadRequest, err, startTime, r.URL.Path, bodySize)
		return
	}

	session, err := getIntegrationSession(r)
	if err != nil {
		api.ResponseWithError(e.log, r.Context(), w, http.StatusBadRequest, err, startTime, r.URL.Path, bodySize)
		return
	}

	url, err := e.services.Integrator.GetSessionDataURL(project, integration, session)
	if err != nil {
		api.ResponseWithError(e.log, r.Context(), w, http.StatusBadRequest, err, startTime, r.URL.Path, bodySize)
		return
	}

	resp := map[string]string{"url": url}
	api.ResponseWithJSON(e.log, r.Context(), w, resp, startTime, r.URL.Path, bodySize)
}
