
import { DBInsert_Workspace, DBUpdate_Workspace, delete_Workspace, insert_Workspace, select_Workspace, update_Workspace } from '../../generated-definitions/db/DBHelpers'
import { DBType_Workspace } from '../../generated-definitions/db/DBTypes'
import Module_Base, { makeFunctionIdSafe } from '../Module_Base'

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
}
