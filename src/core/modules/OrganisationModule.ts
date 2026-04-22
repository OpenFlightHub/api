import {DBUpdate_Organisation, delete_Organisation, insert_Organisation, select_Organisation, update_Organisation} from '../../generated-definitions/db/DBHelpers'
import Module_Base, { makeFunctionIdSafe } from '../Module_Base'
import * as pgp from 'pg-promise'
import { DBType_Organisation, DBType_Organisation_StateType, DBType_User } from '../../generated-definitions/db/DBTypes'
import { getCore } from '..'
import { deduplicateIdArray } from '../../util/array'
//@ts-ignore
const db = global.db as pgp.IDatabase<any>

export default class OrganisationModule extends Module_Base<
    {
        id: number
    },

    {
        create_organisation: {
            eventDataType: DBType_Organisation,
            availableContexts: 'id'
        },
        update_organisation: {
            eventDataType: DBType_Organisation,
            availableContexts: 'id'
        },
        delete_organisation: {
            eventDataType: DBType_Organisation,
            availableContexts: 'id'
        }
    }
> {

    constructor(){
        super()
    }


    async createOrganisation(values: {
        name: string
        owner_user_id: number
        state?: DBType_Organisation_StateType
    }){

        const organisation = await insert_Organisation(values)//TODO do we need to check for user id being correct or does the foreign key constraint kick in?

        this.dispatch('create_organisation', {
            id: organisation.id
        }, organisation)

        return organisation
    }

    /**
     *
     * @returns false if does not exist
     * @see updateOrganisationSafe
     */
    async updateOrganisation(id: number, data: DBUpdate_Organisation){
        const organisation = await update_Organisation(id, data)

        if(organisation === false){
            return false
        }

        this.dispatch('update_organisation', {
            id: organisation.id
        }, organisation)

        return organisation
    }

    /**
     *
     * @see updateOrganisation
     */
    updateOrganisationSafe = makeFunctionIdSafe(this, this.updateOrganisation)

    /**
     *
     * @returns false if does not exist
     * @see deleteOrganisationSafe
     */
    async deleteOrganisation(id: number){
        const organisation = await delete_Organisation(id)

        if(organisation === false){
            return false
        }

        this.dispatch('delete_organisation', {
            id: organisation.id
        }, organisation)
    }

    /**
     *
     * @see deleteOrganisation
     */
    deleteOrganisationSafe = makeFunctionIdSafe(this, this.deleteOrganisation)

    /**
     *
     * @returns false if does not exist
     * @see getOrganisationSafe
     */
    async getOrganisation(id: number){
        return await select_Organisation(id)
    }

    /**
     *
     * @see getOrganisation
     */
    getOrganisationSafe = makeFunctionIdSafe(this, this.getOrganisation)


    async userCanEditOrganisation(userId: number, organisation_id: number) {

        const organisation = await this.getOrganisationSafe(organisation_id)

        if(await getCore().modules.user.userIsAdmin(userId)){
            return true
        }

        if(organisation.owner_user_id = userId){
            return true
        }

        return false
    }

    async getOrganisationsUserHasAccessTo(user: DBType_User){
        const organisations = await select_Organisation(pgp.as.format('WHERE owner_user_id = ${userId}', {userId: user.id}))

        if(typeof user.team_id === 'number'){
            const directTeam = await getCore().modules.team.getTeamSafe(user.team_id)

            if(typeof directTeam.organisation_id === 'number'){
                organisations.push(await this.getOrganisationSafe(directTeam.organisation_id))
            }
        }

        return deduplicateIdArray(organisations)
    }
}
