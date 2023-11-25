import { IDynamicKeyData, IHistorico } from "../interfaces/historico";
import { tasktimeUpdateDto } from "../dtos/tasks/tasktimeUpdateDto";
import { taskRepository } from "../repositories/TaskRepository";
import { TaskUpdateDto } from "../dtos/tasks/taskUpdateDto";
import historicTask from "../services/historicService"
import TaskService from "../services/taskService";
import userService from "../services/userService";
import taskService from "../services/taskService";
import fileService from "../services/fileService";
import { Request, Response } from "express";
import { IFile } from "../interfaces/files";
import { Task } from "../models";

class TaskController {
  public async createTask(req: Request, res: Response) {
    try {
      const taskData: Task = req.body;
      const createdTask = await TaskService.createTask(taskData);

      if (createdTask && taskData.customInterval > 0) {
        await TaskService.createFutureTasks(createdTask as Task);
      }
      res.status(200).json({ message: "Task created successfully", data: createdTask });
    } catch (error) {
      res.status(400).json({ error: "Error creating task" });
    }
  }

  public async getAllTasks(req: Request, res: Response) {
    try {
      const allTasks = await TaskService.getAllTasks();
      res.status(200).json({ message: "All tasks", data: allTasks });
    } catch (error) {
      res.status(400).json({ error: "Tasks not found" });
    }
  }

  public async shareTask(req: Request, res: Response) {
    try {
      const taskId = parseInt(req.params.id, 10);
      const usersIds: number[] = req.body.usersIds
      await taskService.shareTask(taskId, usersIds)
      return res.status(200).json({ message: "Task sharing was successful." })
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async getAllSharedTasks(req: Request, res: Response) {
    try {
      const allTasks = await TaskService.getAllSharedTasks();
      res.status(200).json({ message: "All shared tasks", data: allTasks });
    } catch (error) {
      res.status(400).json({ error: "Tasks not found" });
    }
  }

  public async getTasksByUserId(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId, 10);

      const cyclicTasks: Task[] = await TaskService.getTasksByUserId(userId);
      const tasks = cyclicTasks.filter(task => task.customInterval !== 0);

      if (!Array.isArray(cyclicTasks) || cyclicTasks.length === 0) {
        return res.status(404).json({ error: "No tasks found for this user" });
      }
      res.status(200).json({ message: "Tasks found for user", data: tasks });
      //res.status(200).json({ message: "Cyclic tasks found for user", data: tasks });
    } catch (error: any) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  public async getSharedTasksByUserId(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId, 10);

      const sharedTasks = await taskService.getSharedTasksByUserId(userId);

      if (!Array.isArray(sharedTasks) || sharedTasks.length === 0) {
        return res.status(404).json({ error: 'No shared tasks found for this user' });
      }

      res.status(200).json({ message: 'Shared tasks found for user', data: sharedTasks });
    } catch (error: any) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  public async stopTaskSharing(req: Request, res: Response) {
    try {
      const taskId = parseInt(req.params.id, 10);
      const usersIds: number[] = req.body.usersIds;
      if (usersIds.length < 1) {
        return res.status(400).json({ error: "No user IDs provided." })
      }
      const result = await taskService.stopTaskSharing(taskId, usersIds)
      if(result instanceof Error){
        res.status(500).json({ error: 'Internal Server Error' });    
      }
      return res.status(200).json({ message: "Stop sharing with provided users" })
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });    
    }
  }

  public async getTaskById(req: Request, res: Response) {
    try {
      const id: string = req.params.id;
      let task;
      const taskId: number = parseInt(id, 10);
      task = await TaskService.getTaskById(taskId);

      if (task === null) {
        res.status(400).json({ error: "Task not found" });
      } else {
        res.status(200).json({ message: "Task found", data: task });
      }

    } catch (error: any) {
      if (error.message === "Task not found") {
        res.status(400).json({ error: "Task not found" });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }

  public async getExpiredTasks(req: Request, res: Response) {
    const { id, date } = req.params;
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "parameter 'id' is not a valid number" })
    }

    try {
      const tasks = await TaskService.getExpiredTasks(userId, date);

      if (tasks.recorrente.length === 0 && tasks.naoRecorrente.length === 0) {
        return res.status(404).json({ error: "No tasks found for this user" });
      }
      tasks.recorrente = [... new Set(tasks.recorrente)]
      res.status(200).json({ message: "Expired tasks found for user", data: tasks });

    } catch (error: any) {
      if (error.message === "User not found") {
        res.status(404).json({ error: "User not found" });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }

  public async getTimeSpentByMonth(req: Request, res: Response) {
    const { id, month } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "parameter 'id' is not a valid number" })
    }

    try {
      const timeSpent = await TaskService.getTimeSpentByMonth(userId, parseInt(month));
      res.status(200).json({ message: "Time spent found for user", data: timeSpent });
    } catch (error: any) {
      if (error.message === "User not found") {
        res.status(404).json({ error: "User not found" });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }

  public async getTimeSpentMonthly(req: Request, res: Response) {
    const { id, year } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "O parâmetro 'id' não é um número válido" });
    }

    try {
      const timeSpent = await taskService.getTimeSpentMonthly(userId, parseInt(year));
      res.status(200).json({ message: "Tempo gasto encontrado para o usuário", data: timeSpent });
    } catch (error: any) {
      if (error.message === "User not found") {
        res.status(404).json({ error: "Usuário não encontrado" });
      } else {
        res.status(500).json({ error: "Erro interno do servidor" });
      }
    }
  }


  public async updateTask(req: Request, res: Response) {
    let { id } = req.params;
    const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
    try {
      let taskUpdate: TaskUpdateDto = req.body;

      if (isNaN(parseInt(id, 10))) {

        if (!mongoIdRegex.test(id)) {
          return res.status(400).json({ error: "Only today's task can be updated." });
        } else {
          return res.status(400).json({ error: "ID cannot be null." });
        }

      } else {
        let taskid = parseInt(id, 10);
        let task = taskService.updateTask(taskid, taskUpdate as Task)
        taskUpdate.id = taskid
        if (taskUpdate.customInterval !== 0) {
          await TaskService.updateFutureTasks(taskUpdate as Task);
        } else {
          await TaskService.deleteAllFutureTasks(taskUpdate.id as number);
        }

        return res.status(200).json({ message: "Task updated successfully", data: task });
      }
    } catch (error: any) {
      console.log(error)
      if (error.message === "Task not found") {
        res.status(404).json({ error: "Task not found" });
      } else {
        res.status(500).json({ error: "Internal Server Error", data: JSON.stringify(error) });
      }
    }
  }

  public async updatetaskTimeSpent(req: Request, res: Response) {

    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "parameter 'id' is not a valid number" })
    }

    try {
      let taskUpdate: tasktimeUpdateDto = req.body;
      let task = taskRepository.create(taskUpdate);
      task.id = parseInt(id, 10);

      await taskRepository.save(task);
      return res.status(200).json({ message: "Task updated successfully", data: task });
    }

    catch (error: any) {
      if (error.message === "Task not found") {
        res.status(404).json({ error: "Task not found" });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }

  public async repeatTask(req: Request, res: Response) {
    try {
      let id = req.params.id;

      const taskId = parseInt(id, 10);
      if (!taskId) {
        return res.status(400).json({ message: "parameter 'id' is not a valid number or not exists" });
      }

      await TaskService.cloneTask(taskId);
      await TaskService.deleteFutureTask(taskId);
      const refreshedTask = await TaskService.refreshTask(taskId);
      res.status(200).json({ message: "Task repeated successfully", data: refreshedTask });

    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
  public async getAllNonCyclicTasks(req: Request, res: Response) {
    try {
      let id = req.params.id
      const userId = parseInt(id, 10)
      if (!userId) {
        return res.status(400).json({ message: "parameter 'id' is not a valid number or not exists" })
      }
      const tasks = await TaskService.getAllNonCyclicTasks(userId);
      res.status(200).json({ message: "Found Tasks", data: tasks })
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  public async deleteTask(req: Request, res: Response) {
    const { id, userId } = req.params;
    //const deleteMessage = req.body.deleteMessage;
    try {
        const taskId: number = parseInt(id, 10);
        const userIdNumber: number = parseInt(userId, 10);

        if (isNaN(taskId) || isNaN(userIdNumber)) {
            return res.status(400).json({ message: "IDs inválidos" });
        }

        /* if(deleteMessage){
          console.log("deletada")
          await taskService.HistoricDeleteTask(taskId, userIdNumber, deleteMessage);
        } */
        const task = await TaskService.deleteTask(taskId, userIdNumber);
        console.log(task)
        if (task instanceof Error) {
            if (task.message === "Task not found") {
                res.status(404).json({ error: "Task not found" });
            } else if (task.message === "Permission denied. You do not have permission to delete this task.") {
                res.status(403).json({ error: "Permission denied. You are not the owner of this task." });
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        } else {
            res.status(200).json({ message: "Task deleted successfully", data: task });
        }
    } catch (error: any) {
        res.status(500).json({ error: "Internal Server Error", data: error });
    }
}

public async ReasonDeleteTask(req: Request, res: Response) {
  const { id, userId } = req.params;
  const deleteMessage = req.body.deleteMessage;
  console.log(id, userId, deleteMessage)
  console.log("oi", deleteMessage)
  try {
      const taskId: number = parseInt(id, 10);
      const userIdNumber: number = parseInt(userId, 10);

      if (isNaN(taskId) || isNaN(userIdNumber)) {
          return res.status(400).json({ message: "IDs inválidos" });
      }

      if(deleteMessage){
        console.log("deletada")
        const a = await taskService.HistoricDeleteTask(taskId, userIdNumber, deleteMessage);
        console.log(a)

      }
      const task = await TaskService.deleteTask(taskId, userIdNumber);
      res.status(200).json({ message: "Task deleted successfully", data: task });
  } catch (error: any) {
      res.status(500).json({ error: "Internal Server Error", data: error });
  }
}


  public async getHistoricTaskById(req: Request, res: Response) {
    const id: number = parseInt(req.params.id, 10);
    try {
      if (isNaN(id)) {
        return res.status(400).json({ error: "Algo deu errado ao buscar um parâmetro." })
      }
      const updateTask: IDynamicKeyData = await historicTask.getHistoricEditTask(id)
      res.status(200).json(updateTask)
    } catch (error: any) {
      res.status(500).json(error)
    }
  }

  public async getHistoricTaskByUser(req: Request, res: Response) {
    const idUser: number = parseInt(req.params.idUser, 10);
    try {
      if (isNaN(idUser)) {
        return res.status(400).json({ error: "Algo deu errado ao buscar um parâmetro." })
      }
      const searchedTasks: IDynamicKeyData = await historicTask.getHistoricTaskByUser(idUser)
      res.status(200).json(searchedTasks)
    } catch (error: any) {
      res.status(500).json(error)
    }
  }

  public async getHisotricTaskByOwner(req: Request, res: Response) {
    const idUser: number = parseInt(req.params.idUser, 10)
    try {
      if (isNaN(idUser)) {
        return res.status(400).json({ error: "Algo deu errado ao buscar um parâmetro." })
      }
      const searchOwner = await historicTask.getHistoricTaskByOwner(idUser)
      res.json(searchOwner)
    } catch (error) {

    }
  }

  public async getDeleteHistoricTaskByUser(req: Request, res: Response) {
    const userId: number = parseInt(req.params.userId, 10)
    try {
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Algo deu errado ao buscar um parâmetro." })
      }
      const tasks = await taskService.getHistoricDeleteTaskByUser(userId)
      return res.status(200).json(tasks)
    } catch (error) {
      return res.status(500).json(error)
    }
  }

  public async getHistoricDeleteTask(req: Request, res: Response) {
    const taskId: number = parseInt(req.params.id, 10)
    try {
      if (isNaN(taskId)) {
        return res.status(400).json({ error: "Algo deu errado ao buscar um parâmetro." })
      }
      const tasks = await taskService.getHistoricDeleteTask(taskId)
      return res.status(200).json(tasks)
    } catch (error) {
      return res.status(500).json(error)
    }
  }

  public async getHistoricSharedtasks(req: Request, res: Response) {
    const userId: number = parseInt(req.params.idUser, 10)
    try {
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Algo deu errado ao buscar um parâmetro." })
      }
      const search = await historicTask.getHistoricSharedtasks(userId)
      res.status(200).json(search)
    } catch (error: any) {
      res.status(500).json(error)
    }
  }

  public async UpdateHistorico(req: Request, res: Response) {
    const idTask: number = parseInt(req.params.idTask, 10);
    const idUser: number = parseInt(req.params.idUser, 10);
    try {
      const user = await userService.getUserById(idUser);
      if (!user.email) {
        return res.status(400).json({ error: "Usuario não encontrado" })
      }
      let taskUpdate: TaskUpdateDto = req.body;
      const updateTask: IHistorico = await historicTask.HistoricEditTask(idTask, taskUpdate, { id: idUser, name: user.name })
      res.status(200).json(updateTask)
    } catch (error: any) {
      res.status(500).json(error)
    }
  }

  public async FileUpload(req: Request, res: Response) {
    const idTask: number = parseInt(req.params.idTask, 10);
    const data = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Arquivos inválidos' });
    }
    if (isNaN(idTask)) {
      return res.status(400).json({ error: "Algo deu errado ao buscar um parâmetro." })
    }
    try {
      const files = Object.values(data) as unknown as IFile[]
      const uploadFiles = await fileService.sendFile(idTask, files.flat())
      res.json(uploadFiles);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno do servidor.'});
    }
  }

  public async DeleteFile(req: Request, res: Response){
      const idTask: number = parseInt(req.params.idTask, 10);
      const idFile: number = parseInt(req.params.idFile, 10);
      try {
        await fileService.deleteFile(idTask, idFile)
        res.status(200).json({ data: "Ok" })
      } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor.'});
      }
  }
}

export default new TaskController();
