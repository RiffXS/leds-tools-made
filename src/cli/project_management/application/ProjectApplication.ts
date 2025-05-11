import {  Model } from "../../../language/generated/ast.js";
import { AbstractApplication } from "./AbstractApplication.js";
/*import { Project } from "made-report-lib-test";*/
import { ProjectBuilder } from './builders/ProjectBuilder.js';

export  class ProjectApplication extends AbstractApplication {

    constructor(target_folder:string, model: Model) {

        super(target_folder, model)       
        this.jsonFile = "project.json"
        
    }
    
    public async create(){
        const project = this.model.project

        const instance = new ProjectBuilder()
            .setId(project.id.toLocaleLowerCase()?? "")
            .setName(project.name[0] ?? "")
            .setDescription(project.description[0] ?? "" )
            .setStartDate(project.startDate[0] ?? "")
            .setDueDate(project.dueDate[0] ?? "")
            .setCompletedDate(project.completedDate[0] ?? "")
            .build()
            
        await this.saveorUpdate(instance)
    }
}