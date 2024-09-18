import { makeAutoObservable, runInAction } from 'mobx';
import Project from './types/project';
import GDPR from './types/gdpr';
import { GLOBAL_HAS_NO_RECORDINGS, SITE_ID_STORAGE_KEY } from 'App/constants/storageKeys';
import { projectsService } from "App/services";

export default class ProjectsStore {
  list: Project[] = [];
  instance: Project | null = null;
  siteId: string | null = null;
  active: Project | null = null;
  sitesLoading = false;

  constructor() {
    const storedSiteId = localStorage.getItem(SITE_ID_STORAGE_KEY);
    this.siteId = storedSiteId ?? null;
    makeAutoObservable(this);
  }

  getSiteId = () => {
    return {
      siteId: this.siteId,
      active: this.active,
    };
  }

  initProject = (project: Partial<Project>) => {
    this.instance = new Project(project);
  }

  setSitesLoading = (loading: boolean) => {
    this.sitesLoading = loading;
  }

  setSiteId(siteId: string) {
    this.siteId = siteId;
    localStorage.setItem(SITE_ID_STORAGE_KEY, siteId.toString());
    this.active = this.list.find((site) => site.id! === siteId) ?? null;
  }

  editGDPR(gdprData: Partial<GDPR>) {
    if (this.instance) {
      this.instance.gdpr.edit(gdprData);
    }
  }

  editInstance = (instance: Partial<Project>) => {
    if (!this.instance) return;
    this.instance.edit(instance);
  }

  async fetchGDPR(siteId: string) {
    try {
      const response = await projectsService.fetchGDPR(siteId)
      runInAction(() => {
        if (this.instance) {
          Object.assign(this.instance.gdpr, response.data);
        }
      });
    } catch (error) {
      console.error('Failed to fetch GDPR:', error);
    }
  }

  saveGDPR = async (siteId: string) => {
    if (!this.instance) return;
    try {
      const gdprData = this.instance.gdpr.toData();
      const response = await projectsService.saveGDPR(siteId, gdprData);
      this.editGDPR(response.data);
    } catch (error) {
      console.error('Failed to save GDPR:', error);
    }
  }

  fetchList = async (siteIdFromPath: string) =>{
    this.setSitesLoading(true);
    try {
      const response = await projectsService.fetchList();
      runInAction(() => {
        this.list = response.data.map((data) => new Project(data));
        const siteIds = this.list.map(site => site.id);
        let siteId = this.siteId;
        const siteExists = siteId ? siteIds.includes(siteId) : false;

        if (siteIdFromPath && siteIds.includes(siteIdFromPath)) {
          siteId = siteIdFromPath;
        } else if (!siteId || !siteExists) {
          siteId = siteIds.includes(this.siteId)
                   ? this.siteId
                   : response.data[0].projectId;
        }

        const hasRecordings = this.list.some(site => site.recorded);
        if (!hasRecordings) {
          localStorage.setItem(GLOBAL_HAS_NO_RECORDINGS, 'true');
        } else {
          localStorage.removeItem(GLOBAL_HAS_NO_RECORDINGS);
        }
        if (siteId) {
          this.setSiteId(siteId);
        }
      });
    } catch (error) {
      console.error('Failed to fetch site list:', error);
    } finally {
      this.setSitesLoading(false);
    }
  }

  save = async (projectData: Partial<Project>) => {
    try {
      const response = await projectsService.saveProject(projectData);
      runInAction(() => {
        const newSite = new Project(response.data);
        const index = this.list.findIndex(site => site.id === newSite.id);
        if (index !== -1) {
          this.list[index] = newSite;
        } else {
          this.list.push(newSite);
        }
        this.setSiteId(newSite.id);
        this.active = newSite;
      });
    } catch (error) {
      console.error('Failed to save site:', error);
    }
  }

  updateProjectRecordingStatus = (siteId: string, status: boolean) => {
    const site = this.list.find(site => site.id === siteId);
    if (site) {
      site.recorded = status;
      const hasRecordings = this.list.some(site => site.recorded);
      if (!hasRecordings) {
        localStorage.setItem(GLOBAL_HAS_NO_RECORDINGS, 'true');
      } else {
        localStorage.removeItem(GLOBAL_HAS_NO_RECORDINGS);
      }
    }
  }
}

