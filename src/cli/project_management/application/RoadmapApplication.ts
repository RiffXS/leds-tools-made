
import { isRoadmap, Model } from "../../../language/generated/ast.js";
import { AbstractApplication } from "./AbstractApplication.js";
import { Roadmap, Issue, Release, Milestone } from "made-report-lib-test";

export class RoadmapApplication extends AbstractApplication {

    constructor(target_folder: string, model: Model) {

        super(target_folder, model)
        this.jsonFile = "roadmap.json"
    }

    public async create() {

        const roadmaps = this.model.components.filter(isRoadmap);

       await Promise.all(roadmaps.map(async roadmap => {
        const instance: Roadmap = {
            id: roadmap.id,
            name: roadmap.name[0] ?? "",
            description: roadmap.description[0] ?? "",
            milestones: await Promise.all(
                (roadmap.milestones ?? []).map(async milestone => ({
                    id: milestone.id,
                    name: milestone.name[0],
                    description: milestone.description[0],
                    startDate: milestone.startDate[0],
                    dueDate: milestone.dueDate[0],
                    status: milestone.status[0],
                    releases: await Promise.all(
                        (milestone.releases ?? []).map(async release => {
                            // Processa os issues primeiro
                            const issues = release.itens[0]
                                ? [await this.createIssue("", release.itens[0].ref)]
                                : await this.createIssues([
                                    ...(release.itens ?? []),
                                    release.itens[0]
                                ].filter(Boolean));

                            return {
                                id: release.id,
                                version: release.version[0] ?? "",
                                name: release.name[0] ?? "",
                                description: release.description[0] ?? "",
                                dueDate: release.dueDate[0],
                                releasedDate: release.releasedDate[0],
                                status: release.status[0] ?? 'PLANNED',
                                issues
                            } as Release;
                        })
                    )
                })as Milestone) 
            )
        };
        await this.addItem(instance)
        await this.saveorUpdate(instance);
    }));
        await  this.clean()
    }

    private async createIssues(items: any[]): Promise<Issue[]> {
        if (!items?.length) return [];

        // Aguarda todas as Promises de createIssue
        return Promise.all(
            items
                .filter(Boolean) // Remove itens null/undefined
                .map(item => this.createIssue("", item.ref))
        );
    }




}
