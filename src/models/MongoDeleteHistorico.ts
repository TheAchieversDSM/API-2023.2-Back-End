import {Entity, ObjectIdColumn, ObjectId, Column, Index} from "typeorm";

@Entity("historico_delete_task")
@Index(["id", "user"])
export class DeleteHistoricoTask {
  @ObjectIdColumn()
  id!: ObjectId;

  @Column()
  taskId!: number;

  @Column()
  user!: {id: number; name: string};

  @Column()
  date!: string;

  @Column()
  message!: string;
}
