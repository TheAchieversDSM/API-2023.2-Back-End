import { Repository } from "typeorm";
import { DataBaseSource } from "../config/database";
import { Files, Task } from "../models";
import { StorageReference, deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../config/firebase";

class FileService {
    private taskRepository: Repository<Task>;
    private fileRepository: Repository<Files>

    constructor() {
        this.taskRepository = DataBaseSource.getRepository(Task);
        this.fileRepository = DataBaseSource.getRepository(Files)

    }
    public async sendFile(idTask: number, files: Express.Multer.File[]): Promise<any[]> {
        try {
          const listUpload: any[] = [];
          const task = await this.taskRepository.findOne({ where: { id: idTask } })
          if (!task) {
            throw new Error(`Task com ID ${idTask} não encontrada.`);
          }
          
          await Promise.all(files.map(async (file) => {
            const now = new Date();
            const unixTime = Math.floor(now.getTime() / 1000);
            const fileSplited: string[] = file.originalname.split(".")
            const name = `${fileSplited[0]}${unixTime}.${fileSplited[1]}`
            const fileRef: StorageReference = ref(storage, name);
            const uploadTask = uploadBytesResumable(fileRef, file.buffer);
            try {
              await new Promise<void>((resolve, reject) => {
                        uploadTask.on('state_changed',
                        null,
                    (error) => {
                        listUpload.push({ name: name, size: file.size, status: 'error' });
                        reject(error);
                    },
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                            await  this.fileRepository.insert({
                                fileName: name, 
                                fileSize: file.size, 
                                fileType: fileSplited[1], 
                                url: downloadURL, task: task
                            })
                            listUpload.push({ name: name, size: file.size, status: 'Ok', url: downloadURL });
                            resolve();
                        });
                    });
              });
            } catch (error) {
              console.error(`Error uploading file ${name}: ${error}`);
            }
          }));
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