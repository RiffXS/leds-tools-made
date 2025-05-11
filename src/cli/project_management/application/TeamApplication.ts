import { isTeam, Model } from "../../../language/generated/ast.js";
import { AbstractApplication } from "./AbstractApplication.js";
import { Person } from "made-report-lib-test";
import { TeamBuilder }  from "./builders/TeamBuilder.js";

export class TeamApplication extends AbstractApplication {
 
    constructor(target_folder: string, model: Model) {
        super(target_folder, model);  
        
        this.jsonFile = "team.json"   

    }

    public async create(){

        const teams = this.model.components.filter(isTeam);

        teams.map(async team => {

            const instance = new TeamBuilder()
                .setId(team.id)
                .setName(team.name[0] ?? "")
                .setDescription(team.description[0] ?? "")
                .setTeamMembers(team.teammember?.map(teammember => ({
                    id: teammember.id ?? "",
                    name: teammember.name[0] ?? "",
                    email: teammember.email[0] ?? "",
                  } as Person)) ?? [])
                .build()

            await this.addItem(instance)
            await this.saveorUpdate(instance)
        })

        await  this.clean()

    }

}
