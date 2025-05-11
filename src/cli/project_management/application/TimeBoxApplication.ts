
import { AtomicUserStory, Epic, isTimeBox, Model, PlanningItem, TaskBacklog } from "../../../language/generated/ast.js";
import { AbstractApplication } from "./AbstractApplication.js";

import { SprintItem, Person, Issue } from "made-report-lib-test";

import { TimeBoxBuilder } from './builders/TimeBoxBuilder.js';

export class TimeBoxApplication extends AbstractApplication {

    constructor(target_folder: string, model: Model) {

        super(target_folder, model)
        this.jsonFile = "timebox.json"
    }

    public async create() {

        const sprints = this.model.components.filter(isTimeBox)

        sprints.map(async sprint => {

            const sprintItems = (await Promise.all(sprint.sprintBacklog[0]?.planningItems.flatMap(item => this.createTask(item)) as unknown as SprintItem[])).flatMap(item => item)


        const instance = new TimeBoxBuilder()
            .setId(sprint.id)
            .setName(sprint.name[0] ?? "")
            .setDescription(sprint.description[0] ?? "")
            .setStartDate(sprint.startDate[0] ?? "")
            .setEndDate(sprint.endDate[0] ?? "")
            .setStatus(sprint.status[0] ?? "PLANNED")
            .setSprintItems(sprintItems)
            .build()
        
        this.saveorUpdate(instance)
        await this.addItem(instance)
       })

       await  this.clean()
           
    }

    // ter apenas tarefas
    private async createTask(item: PlanningItem) {

        const tasks: Map<string, TaskBacklog> = new Map();

        if (item.backlogItem.ref?.$type == Epic) {

            item.backlogItem.ref?.userstories.map(us => us.tasks.map(task => tasks.set(`${item.backlogItem.ref?.$container.id.toLocaleLowerCase()}.${item.backlogItem.ref?.id.toLocaleLowerCase()}.${us.id.toLocaleLowerCase()}.${task.id.toLocaleLowerCase()}`, task)))
        }

        if (item.backlogItem.ref?.$type == AtomicUserStory) {
            item.backlogItem.ref?.tasks.map(task => tasks.set(`${item.backlogItem.ref?.$container.id.toLocaleLowerCase()}.${item.backlogItem.ref?.id.toLocaleLowerCase()}.${task.id.toLocaleLowerCase()}`, task))
        }

        if (item.backlogItem.ref?.$type == TaskBacklog) {
            tasks.set(`${item.backlogItem.ref?.$container.id.toLocaleLowerCase()}.${item.backlogItem.ref?.id.toLocaleLowerCase()}`, item.backlogItem.ref)
        }

        let response: SprintItem[] = []

        tasks.forEach(async (task, key) => {
            response.push({

                id: key ?? "",
                assignee: {
                    id: item.assignee[0]?.ref?.id,
                    name: item.assignee[0]?.ref?.name[0],
                    email: item.assignee[0]?.ref?.email[0],
                } as Person,
                issue: {
                    id: key ?? "",
                    title: task.name[0] ?? "",
                    description: task.description[0] ?? "",
                    type: task.$type.toLocaleLowerCase() ?? "",
                    depends: await this.createDependece(task)

                },

                startDate: item.startDate[0],
                dueDate: item.dueDate[0],
                // completedDate: item.completedDate,
                status:item.status[0] ?? "TODO"
    
            })
        })

        return response
    }

    private async createDependece(task: TaskBacklog) {
        let issues: Issue[] = []

        if (task.depends) {
            task.depends.map(depend => {
                if (depend.$refNode?.text.toLocaleLowerCase() && depend.ref?.$type.toLocaleLowerCase()) {
                    issues.push({ id: depend.$refNode.text.toLowerCase(), type: depend.ref.$type.toLocaleLowerCase() })
                }
            })
        }
        await task.depends.map(async dep => await issues.push({ id: dep.$refNode?.text.toLocaleLowerCase() ?? "", type: dep.ref?.$type.toLocaleLowerCase() ?? "" }))


        return issues
    }
           
}


