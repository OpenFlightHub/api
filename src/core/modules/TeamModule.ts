import {DBUpdate_Team, delete_Team, insert_Team, select_Team, select_User, update_Team} from '../../generated-definitions/db/DBHelpers'
import Module_Base, { makeFunctionIdSafe } from '../Module_Base'
import * as pgp from 'pg-promise'
import { DBType_Team, DBType_Team_StateType, DBType_User } from '../../generated-definitions/db/DBTypes'
import { getCore } from '..'
import {deduplicateIdArray} from '../../util/array'
//@ts-ignore
const db = global.db as pgp.IDatabase<any>

export default class TeamModule extends Module_Base<
    {
        id: number
    },

    {
        create_team: {
            eventDataType: DBType_Team,
            availableContexts: 'id'
        },
        update_team: {
            eventDataType: DBType_Team,
            availableContexts: 'id'
        },
        delete_team: {
            eventDataType: DBType_Team,
            availableContexts: 'id'
        }
    }
> {

    constructor(){
        super()
    }


    async createTeam(values: {
        name: string
        owner_user_id: number
        organisation_id: number
        state?: DBType_Team_StateType
    }){

        const team = await insert_Team(values)//TODO do we need to check for user id being correct or does the foreign key constraint kick in?

        this.dispatch('create_team', {
            id: team.id
        }, team)

        return team
    }

    /**
     *
     * @returns false if does not exist
     * @see updateTeamSafe
     */
    async updateTeam(id: number, data: DBUpdate_Team){
        const team = await update_Team(id, data)

        if(team === false){
            return false
        }

        this.dispatch('update_team', {
            id: team.id
        }, team)

        return team
    }

    /**
     *
     * @see updateTeam
     */
    updateTeamSafe = makeFunctionIdSafe(this, this.updateTeam)

    /**
     *
     * @returns false if does not exist
     * @see deleteTeamSafe
     */
    async deleteTeam(id: number){
        const team = await delete_Team(id)

        if(team === false){
            return false
        }

        this.dispatch('delete_team', {
            id: team.id
        }, team)
    }

    /**
     *
     * @see deleteTeam
     */
    deleteTeamSafe = makeFunctionIdSafe(this, this.deleteTeam)

    /**
     *
     * @returns false if does not exist
     * @see getTeamSafe
     */
    async getTeam(id: number){
        return await select_Team(id)
    }

    /**
     *
     * @see getTeam
     */
    getTeamSafe = makeFunctionIdSafe(this, this.getTeam)


    async userCanEditTeam(userId: number, teamId: number) {
        const team = await this.getTeamSafe(teamId)

        if(await getCore().modules.user.userIsAdmin(userId)){
            return true
        }

        if(typeof team.organisation_id === 'number' && await getCore().modules.organisation.userCanEditOrganisation(userId, team.organisation_id) === true){
            return true
        }

        if(team.owner_user_id === userId){
            return true
        }

        return false
    }

    async getTeamsUserHasAccessTo(user: DBType_User){
        const teams = await select_Team(pgp.as.format('WHERE owner_user_id = ${userId}', {userId: user.id}))

        if(typeof user.team_id === 'number'){
            teams.push(await this.getTeamSafe(user.team_id))
        }

        return deduplicateIdArray(teams)
    }
}
