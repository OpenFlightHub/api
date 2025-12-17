
import { DBInsert_Workspace, DBUpdate_Workspace, delete_Workspace, insert_Workspace, select_Workspace, update_Workspace } from '../../generated-definitions/db/DBHelpers'
import { DBType_Workspace } from '../../generated-definitions/db/DBTypes'
import { getCore } from '../index'
import Module_Base from './Module_Base'

export default class WorkspaceModule extends Module_Base<
    {
        id: number
    },

    {
        create: {
            eventDataType: DBType_Workspace,
            availableContexts: 'id'
        },
        update: {
            eventDataType: DBType_Workspace,
            availableContexts: 'id'
        },
        delete: {
            eventDataType: DBType_Workspace,
            availableContexts: 'id'
        }
    }
> {

    constructor(){
        super()
    }

    async create(data: DBInsert_Workspace){
        const workspace = await insert_Workspace(data)

        this.dispatch('create', {
            id: workspace.id
        }, workspace)

        return workspace
    }

    async update(id: number, data: DBUpdate_Workspace){
        const workspace = await update_Workspace(data, id)

        this.dispatch('update', {
            id: workspace.id
        }, workspace)

        return workspace
    }

    async delete(id: number){
        const workspace = await delete_Workspace(id)

        this.dispatch('delete', {
            id: workspace.id
        }, workspace)
    }

    async get(id: number){
        return await select_Workspace(id)
    }

    //TODO move all the workspace scoped events in here ??? (like drone position and such)
}
