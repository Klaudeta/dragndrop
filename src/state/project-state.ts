namespace App {
  type Listener = (items: Project[]) => void;

  // Project State Management
  export class ProjectState {
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {}

    static getInstance() {
      if (!this.instance) {
        this.instance = new ProjectState();
      }
      return this.instance;
    }

    addListener(listenerFn: Listener) {
      this.listeners.push(listenerFn);
    }

    addProject(title: string, description: string, numOfPeople: number) {
      const newProject = new Project(
        Math.random().toString(),
        title,
        description,
        numOfPeople,
        ProjectStatus.Active
      );
      this.projects.push(newProject);
      this.updateListeners();
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
      const project = this.projects.find((prj) => prj.id === projectId);
      if (project && project.status !== newStatus) {
        project.status = newStatus;
        this.updateListeners();
      }
    }

    private updateListeners() {
      for (const listenerFn of this.listeners) {
        listenerFn(this.projects.slice());
      }
    }
  }

  export const projectState = ProjectState.getInstance();
}
