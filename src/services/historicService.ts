import { MongoRepository, Repository } from "typeorm";
import { HistoricoTask } from "../models/MongoHisotirico";
import { MongoDataSource } from "../config/mongoConfig";
import { DeleteHistoricoTask } from "../models/MongoDeleteHistorico";
import { IDynamicKeyData, IHistorico } from "../interfaces/historico";
import { TaskUpdateDto } from "../dtos/tasks/taskUpdateDto";
import { Task } from "../models";
import { DataBaseSource } from "../config/database";

class HistoricService {
    private arrayFields: string[] = ["name", "description", "priority", "status", "done", "customInterval", "lastExecution", "timeSpent", "deadline"];
    private taskRepository: Repository<Task>;
    private mongoHistoricoRepository: MongoRepository<HistoricoTask>;
    private mongoDeleteHistoricoRepository: MongoRepository<DeleteHistoricoTask>;
    constructor(){
        this.taskRepository = DataBaseSource.getRepository(Task);
        this.mongoHistoricoRepository = MongoDataSource.getMongoRepository(HistoricoTask);
        this.mongoDeleteHistoricoRepository = MongoDataSource.getMongoRepository(DeleteHistoricoTask);
    }

    public async HistoricEditTask(idTask: number, taskUpdate: TaskUpdateDto, user: { name: string, id: number }) {
        try {
            
            const task = await this.taskRepository.findOne({ where: { id: idTask } });
            let historicoEdit: IHistorico = {
                taskName: task?.name,
                owner: task?.userId,
                taskId: idTask,
                user,
                data: new Date().toISOString(),
                campo: {}
            };
            if(!taskUpdate){
                return historicoEdit
            }
            if(taskUpdate.name){
                historicoEdit.taskName = taskUpdate.name
            }

            console.log(historicoEdit)
            if (task) {
                for (const field of this.arrayFields) {
                    if ((taskUpdate as any)[field] !== undefined && (task as any)[field] !== (taskUpdate as any)[field]) {
                        historicoEdit.campo[field] = {
                            old: (task as any)[field],
                            new: (taskUpdate as any)[field]
                        };
                    }
                }
                const save = await this.mongoHistoricoRepository.save(historicoEdit);
                return save;
            }
            return historicoEdit
        } catch (error: any) {
            throw new Error(error);
        }
    }

    public async getHistoricTaskByOwner(idUser: number) {
        const historicTaskByOwner = await this.mongoHistoricoRepository.find({ where: { owner: idUser } });
        const grupoNames: IDynamicKeyData = {};
        historicTaskByOwner.sort((a: IHistorico, b: IHistorico) => {
            const dataA = new Date(a.data).getTime();
            const dataB = new Date(b.data).getTime();
            return dataB - dataA;
        });
        const listIds = historicTaskByOwner.map(task => ({ id: task.taskId, name: task.taskName }));
        historicTaskByOwner.forEach(task => {
            let taskName = listIds.filter(filterTask => filterTask.id === task.taskId)[0]?.name;
            if (taskName) {
                if (!grupoNames[taskName]) {
                    grupoNames[taskName] = [];
                }
                const existingTask = grupoNames[taskName].find(existing => existing.taskId === task.taskId);
                if (existingTask) {
                    grupoNames[taskName] = [...grupoNames[taskName]]
                    grupoNames[taskName].push(task);
                } else {
                    grupoNames[taskName].push(task);
                }
            }
        });
        
        return grupoNames;
    }

    public async getHistoricTaskByUser(idUser: number): Promise<IDynamicKeyData> {
        try {
            const grupoDatas: IDynamicKeyData = {};
            const search = await this.mongoHistoricoRepository.find({ 
                where:{ "user.id": { $eq: idUser }}
            });
            search.sort((a: IHistorico, b: IHistorico) => {
                const dataA = new Date(a.data).getTime();
                const dataB = new Date(b.data).getTime();
                return dataB - dataA;
            });
            search.forEach(task => {
                const data = task.data.slice(0, 10);
                if (!grupoDatas[data]) {
                    grupoDatas[data] = [];
                }
                grupoDatas[data].push(task);
            });
            
            return grupoDatas;
        } catch (error: any) {
            throw new Error(error)
        }
    }

    public async getHistoricEditTask(idTask: number): Promise<IDynamicKeyData> {
        try {
            const findTask = await this.mongoHistoricoRepository.find({ where: { "taskId": { $eq: idTask } } })
            const grupoDatas: IDynamicKeyData = {};
            findTask.sort((a: IHistorico, b: IHistorico) => {
                const dataA = new Date(a.data).getTime();
                const dataB = new Date(b.data).getTime();
                return dataB - dataA;
            });
            findTask.forEach((task) => {
                const data = task.data.slice(0, 10);
                if (!grupoDatas[data]) {
                    grupoDatas[data] = [];
                }
                grupoDatas[data].push(task);
            });
            return grupoDatas;
        } catch (error: any) {
            throw new Error(error)
        }
    }
}


export default new HistoricService()