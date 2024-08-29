import { makeAutoObservable, runInAction } from 'mobx';
import { customEventService } from 'App/services';
import Audit from 'MOBX/types/audit';
import CustomEvent from 'App/mstore/types/customEvent';

export default class CustomEventsStore {
  list: CustomEvent[] = [
    CustomEvent.fromJson({
      id: '1',
      name: 'Event 1',
      description: 'Description 1',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: '1',
        name: 'User 1'
      }
    }),
    CustomEvent.fromJson({
      id: '2',
      name: 'Event 2',
      description: 'Description 2',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: '1',
        name: 'User 1'
      }
    }),
    CustomEvent.fromJson({
      id: '3',
      name: 'Event 3',
      description: 'Description 3',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: '1',
        name: 'User 1'
      }
    })
  ];


  constructor() {
    makeAutoObservable(this);
  }

  fetchAll = async (params: any = {}) => {
    return new Promise((resolve, reject) => {
      customEventService.fetchAll(params).then((response: any) => {
        runInAction(() => {
          this.list = response.data.map((item: any) => CustomEvent.fromJson(item));
        });
        resolve(this.list);
      }).catch(error => {
        reject(error);
      }).finally(() => {
        // this.isLoading = false;
      });
    });
  };

  createCustomEvent = async (data: any) => {
    return new Promise((resolve, reject) => {
      customEventService.create(data).then(response => {
        runInAction(() => {
          this.list.push(CustomEvent.fromJson(response.data));
        });
        resolve(response);
      }).catch(error => {
        reject(error);
      });
    });
  };

  updateCustomEvent = async (data: any) => {

  };

}
