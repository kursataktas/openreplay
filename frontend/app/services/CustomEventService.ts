import BaseService from './BaseService';

export default class CustomEventService extends BaseService {
  async fetchAll(params: {}): Promise<[]> {
    return this.client.get('/custom-events', params)
      .then(r => r.json()).then(j => j.data);
  }

  async create(data: {}): Promise<{}> {
    return this.client.post('/custom-events', data)
      .then(r => r.json()).then(j => j.data);
  }

  async update(data: {}): Promise<{}> {
    return this.client.put(`/custom-events/${data.id}`, data)
      .then(r => r.json()).then(j => j.data);
  }

  async delete(id: string): Promise<{}> {
    return this.client.delete(`/custom-events/${id}`)
      .then(r => r.json()).then(j => j.data);
  }

  async fetchOne(id: string): Promise<{}> {
    return this.client.get(`/custom-events/${id}`)
      .then(r => r.json()).then(j => j.data);
  }
}
