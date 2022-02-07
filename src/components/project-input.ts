/// <reference path = "../components/base-component.ts" />
/// <reference path = "../util/validation.ts" />
/// <reference path = "../decorators/autobind-decorator.ts" />
/// <reference path = "../state/project-state.ts" />
namespace App {
    export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    
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
          const userInput = this.gatherUserInput();
          if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
            this.clearInputs();
          }
        }
    
      }
}