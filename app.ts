/// <reference path = "drag-drop-interfaces.ts" />
/// <reference path = "project-model.ts" />
namespace App {
    

    type Listener = (items: Project[]) => void;
    
    
    // Project State Management
    class ProjectState {
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
    
      moveProject(projectId: string, newStatus: ProjectStatus){
        const project = this.projects.find(prj => prj.id === projectId);
        if(project && project.status !== newStatus){
            project.status = newStatus;
            this.updateListeners();
        }
      }
    
      private updateListeners(){
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
          }
      }
    }
    
    const projectState = ProjectState.getInstance();
    
    interface Validatable {
      value: string | number;
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
    }
    
    function validate(validatableInput: Validatable) {
      let isValid = true;
      if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
      }
      if (
        validatableInput.minLength != null &&
        typeof validatableInput.value === "string"
      ) {
        isValid =
          isValid && validatableInput.value.length > validatableInput.minLength;
      }
      if (
        validatableInput.maxLength != null &&
        typeof validatableInput.value === "string"
      ) {
        isValid =
          isValid && validatableInput.value.length < validatableInput.maxLength;
      }
      if (
        validatableInput.min != null &&
        typeof validatableInput.value === "number"
      ) {
        isValid = isValid && validatableInput.value > validatableInput.min;
      }
      if (
        validatableInput.max != null &&
        typeof validatableInput.value === "number"
      ) {
        isValid = isValid && validatableInput.value < validatableInput.max;
      }
      return isValid;
    }
    
    function Autobind(
      target: any,
      methodName: String,
      propertyDescriptor: PropertyDescriptor
    ) {
      const originalMethod = propertyDescriptor.value;
      const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
          const boundFn = originalMethod.bind(this);
          return boundFn;
        },
      };
      return adjDescriptor;
    }
    
    // Component Base Class
    abstract class Component<T extends HTMLElement, U extends HTMLElement> {
        templateElement: HTMLTemplateElement;
        hostElement: T;
        element : U;
        
    
        constructor(templateId: string, hostELementId: string, insertAtStart: boolean, newElementId?: string){
            this.templateElement = <HTMLTemplateElement>(
                document.getElementById(templateId)!
              );
              this.hostElement = <T>document.getElementById(hostELementId)!;
    
              const importedNode = document.importNode(
                this.templateElement.content,
                true
              );
              this.element = importedNode.firstElementChild as U;
              if(newElementId){
                this.element.id = newElementId;              
              }
    
              this.attach(insertAtStart);
        }
    
        private attach(insertAtBeginning: boolean) {
            this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
        }
    
        abstract configure(): void;
    
        abstract renderContent(): void; 
    }
    
    class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable{
        private project: Project;
    
        get persons(){
            return this.project.people === 1 ? '1 person' : `${this.project.people} persons`;
        }
    
        constructor(hostId: string, project: Project){
            super('single-project', hostId, false, project.id);
            this.project = project;
            this.configure();
            this.renderContent();
    
        }
        @Autobind
        dragStartHandler(event: DragEvent): void {
            event.dataTransfer!.setData('text/plain', this.project.id);
            event.dataTransfer!.effectAllowed = 'move';
            
        }
    
        dragEndHandler(event: DragEvent): void {
            
        }
    
    
    
        configure(): void {
            this.element.addEventListener('dragstart', this.dragStartHandler);
            this.element.addEventListener('dragend', this.dragEndHandler);
        }
    
        renderContent(): void {
            this.element.querySelector('h2')!.textContent = this.project.title;
            this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
            this.element.querySelector('p')!.textContent = this.project.description;
        }
    }
    
    
    // ProjectList Class
    class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget{
    
      assignedProjects: Project[];
    
      constructor(private type: "active" | "finished") {
        super('project-list', 'app', false, `${type}-projects`)
    
        this.assignedProjects = [];
        
        this.renderContent();
        this.configure();
      }
    
      @Autobind
      dragOverHandler(event: DragEvent): void {
          if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain'){
              event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable');
          }
          
      }
    
      @Autobind
      dropHandler(event: DragEvent): void {
          const prjId = event.dataTransfer!.getData('text/plain');
          projectState.moveProject(prjId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);  
      }
      @Autobind
      dragLeaveHandler(event: DragEvent): void {
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.remove('droppable');
      }
    
      private renderProjects() {
        const listEl = document.getElementById(
          `${this.type}-project-list`
        )! as HTMLUListElement;
        listEl.innerHTML = '';
        for (const projItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id, projItem);
        }
      }
    
      public renderContent() {
        const listId = `${this.type}-project-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector("h2")!.textContent =
          this.type.toUpperCase() + " PROJECTS";
      }
    
      public configure(): void {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);
    
        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj => {
                if(this.type === 'active'){
                    return prj.status === ProjectStatus.Active;
                }else {
                    return prj.status === ProjectStatus.Finished;
                }
            });
          this.assignedProjects = relevantProjects;
          this.renderProjects();
        });
      }
      
    }
    
    class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    
      titleInputElement: HTMLInputElement;
      descInputElement: HTMLInputElement;
      peopleInputElement: HTMLInputElement;
    
      constructor() {
          super('project-input', 'app', true, 'user-input');
     
          this.titleInputElement = this.element.querySelector(
            "#title"
          ) as HTMLInputElement;
          this.descInputElement = this.element.querySelector(
            "#description"
          ) as HTMLInputElement;
          this.peopleInputElement = this.element.querySelector(
            "#people"
          ) as HTMLInputElement;
    
        this.configure();
      }
      public configure() {
        this.element.addEventListener("submit", this.submitHandler);
     
      }
    
      renderContent(): void {
          
      }
    
      private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDesc = this.descInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
    
        const titleValidatable: Validatable = {
          value: enteredTitle,
          required: true,
        };
        const descValidatable: Validatable = {
          value: enteredDesc,
          required: true,
        };
        const peopleValidatable: Validatable = {
          value: +enteredPeople,
          required: true
        };
    
        if (
          !validate(titleValidatable) ||
          !validate(descValidatable) ||
          !validate(peopleValidatable)
        ) {
          alert("Invalid input, please try again!");
          return;
        } else {
          return [enteredTitle, enteredDesc, +enteredPeople];
        }
      }
    
      private clearInputs() {
        this.titleInputElement.value = "";
        this.descInputElement.value = "";
        this.peopleInputElement.value = "";
      }
    
      @Autobind
      private submitHandler(event: Event) {
        event.preventDefault();
        console.log(this.titleInputElement.value);
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
          const [title, desc, people] = userInput;
          projectState.addProject(title, desc, people);
          this.clearInputs();
        }
      }
    
    
    
    }
    
    const projectInput = new ProjectInput();
    const activeProjectList = new ProjectList("active");
    const finishedProjectList = new ProjectList("finished");
    
}
