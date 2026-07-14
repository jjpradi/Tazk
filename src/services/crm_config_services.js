import http from '../http-common';

class CrmConfigService {
  listCustomFields(entityType) {
    const qs = entityType ? `?entityType=${encodeURIComponent(entityType)}` : '';
    return http.get(`/leadsservice/api/config/custom-fields${qs}`);
  }

  createCustomField(payload) {
    return http.post('/leadsservice/api/config/custom-fields', payload);
  }

  updateCustomField(fieldId, payload) {
    return http.put(`/leadsservice/api/config/custom-fields/${fieldId}`, payload);
  }

  deleteCustomField(fieldId) {
    return http.delete(`/leadsservice/api/config/custom-fields/${fieldId}`);
  }

  listStageFieldRules(entityType) {
    const qs = entityType ? `?entityType=${encodeURIComponent(entityType)}` : '';
    return http.get(`/leadsservice/api/config/stage-field-rules${qs}`);
  }

  setStageFieldRules({entityType, stageKey, mandatoryFieldIds}) {
    return http.put('/leadsservice/api/config/stage-field-rules', {
      entityType,
      stageKey,
      mandatoryFieldIds,
    });
  }

  getEntityFieldValues(entityType, entityId) {
    return http.get(
      `/leadsservice/api/config/entity-fields/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
    );
  }

  setEntityFieldValues(entityType, entityId, values) {
    return http.put(
      `/leadsservice/api/config/entity-fields/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
      {values},
    );
  }
}

export default new CrmConfigService();

