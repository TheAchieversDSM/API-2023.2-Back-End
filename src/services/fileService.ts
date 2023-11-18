import { Repository } from "typeorm";
import { DataBaseSource } from "../config/database";
import { Files, Task } from "../models";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "../config/firebase";
import { IFile } from "../interfaces/files";

class FileService {
    private taskRepository: Repository<Task>;
    private fileRepository: Repository<Files>

    constructor() {
        this.taskRepository = DataBaseSource.getRepository(Task);
        this.fileRepository = DataBaseSource.getRepository(Files)

    }
    public async sendFile(idTask: number, files: IFile[]): Promise<any[]> {
        try {
            const listUpload: any[] = [];
            const task = await this.taskRepository.findOne({ where: { id: idTask } })
            if (!task) {
                throw new Error(`Task com ID ${idTask} não encontrada.`);
            }
            files.forEach(async(file: IFile, index: number) => {
                const insert = this.fileRepository.create({ 
                    task: { id: idTask }, 
                    fileName: file.fileName,
                    fileSize: file.fileSize,
                    fileType: file.fileType,
                    url: file.url 
                })
                await this.fileRepository.save(insert)
                listUpload.push({
                    file: index,
                    name: insert.fileName,
                    status: "Ok"
                })
            })
            return listUpload;
        } catch (error: unknown) {
            throw new Error(error as string);
        }
    }
    public async deleteFile(idTask: number, idFile: number) {
        try {
            const fileToDelete = await this.fileRepository.findOne({ 
                where: { 
                    id: idFile, 
                    task: { 
                        id: idTask 
                    }
                }
            });
            await this.fileRepository
                .createQueryBuilder("file")
                .where("id = :idFile AND taskId = :idTask", { idFile, idTask })
                .delete()
                .execute();
            const desertRef = ref(storage, `${fileToDelete?.fileName}`);
            deleteObject(desertRef)
        } catch (error) {
            console.error(`${error}`);
        }
    }
}

export default new FileService()