
import { getCore } from '..'
import { DBInsert_Workspace, DBUpdate_Workspace, delete_Workspace, insert_Workspace, insert_Workspace_Permission, select_Geo_Object, select_Workspace, update_Workspace } from '../../generated-definitions/db/DBHelpers'
import { DBType_Workspace, DBType_Workspace_ForOrganisation, DBType_Workspace_ForTeam } from '../../generated-definitions/db/DBTypes'
import Module_Base, { makeFunctionIdSafe } from '../Module_Base'

import pgp from 'pg-promise'
//@ts-ignore
const db = global.db as pgp.IDatabase<any>

export default class WorkspaceModule extends Module_Base<
    {
        id: number
    },

    {
        create_workspace: {
            eventDataType: DBType_Workspace,
            availableContexts: 'id'
        },
        update_workspace: {
            eventDataType: DBType_Workspace,
            availableContexts: 'id'
        },
        delete_workspace: {
            eventDataType: DBType_Workspace,
            availableContexts: 'id'
        }
    }
> {

    constructor(){
        super()
    }

    async createWorkspace(data: DBInsert_Workspace){
        const workspace = await insert_Workspace(data)

        this.dispatch('create_workspace', {
            id: workspace.id
        }, workspace)

        return workspace
    }

    /**
     *
     * @returns false if does not exist
     * @see updateWorkspaceSafe
     */
    async updateWorkspace(id: number, data: DBUpdate_Workspace){
        const workspace = await update_Workspace(id, data)

        if(workspace === false){
            return false
        }

        this.dispatch('update_workspace', {
            id: workspace.id
        }, workspace)

        return workspace
    }

    /**
     * @see updateWorkspace
     */
    updateWorkspaceSafe = makeFunctionIdSafe(this, this.updateWorkspace)

    /**
     *
     * @returns false if does not exist
     */
    async deleteWorkspace(id: number){
        const workspace = await delete_Workspace(id)

        if(workspace === false){
            return false
        }

        this.dispatch('delete_workspace', {
            id: workspace.id
        }, workspace)
    }

    /**
     * @see deleteWorkspace
     */
    deleteWorkspaceSafe = makeFunctionIdSafe(this, this.deleteWorkspace)

    /**
     *
     * @returns false if does not exist
     * @see getWorkspaceSafe
     */
    async getWorkspace(id: number){
        return await select_Workspace(id)
    }


    /**
     * @see getWorkspace
     */
    getWorkspaceSafe = makeFunctionIdSafe(this, this.getWorkspace)

    //TODO move all the workspace scoped events in here ??? (like drone position and such)

    async inviteTeam(workspaceId: number, teamId: number){
        const workspace = await this.getWorkspaceSafe(workspaceId)

        await insert_Workspace_Permission({
            workspace_id: workspaceId,
            team_id: teamId
        })
    }

    async kickTeam(workspaceId: number, teamId: number){
        const workspace = await this.getWorkspaceSafe(workspaceId)

        const permissions = await this.getPermissions(workspaceId)

        if(!permissions.find(p => p.team_id === teamId)){
            throw new Error('team has no permissions for this workspace')
        }

        if(typeof (workspace as DBType_Workspace_ForTeam).owner_team_id === 'number'){
            if((workspace as DBType_Workspace_ForTeam).owner_team_id === teamId){
                throw new Error('team is the owner of this workspace and cannot be kicked')
            }
        }

        await db.none('DELETE FROM workspace_permissions WHERE workspace_id = ${workspaceId} AND team_id = ${teamId}', {
            workspaceId,
            teamId
        })
    }

    async getPermissions(workspaceId: number){
        return await db.manyOrNone<{team_id: number}>('SELECT team_id FROM workspace_permissions WHERE workspace_id = ${workspaceId}', {
            workspaceId
        })
    }

    async userOwnsWorkspace(workspaceId: number, userId: number){

        const workspace = await this.getWorkspaceSafe(workspaceId)

        if(await getCore().modules.user.userIsAdmin(userId)){
            return true
        }

        if(typeof (workspace as DBType_Workspace_ForTeam).owner_team_id === 'number'){
            return await getCore().modules.team.userOwnsTeam(userId, (workspace as DBType_Workspace_ForTeam).owner_team_id)
        } else {
            return await getCore().modules.organisation.userOwnsOrganisation(userId, (workspace as DBType_Workspace_ForOrganisation).owner_organisation_id)
        }
    }

    async getGeoObjectsForWorkspace(workspaceId: number){
        return await select_Geo_Object(pgp.as.format('WHERE geo_objects.workspace_id = ${workspaceId}', {
            workspaceId
        }))
    }
}
