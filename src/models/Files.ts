import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { Task } from "./Task";
@Entity({name: "files"})
export class Files {
  @PrimaryGeneratedColumn({
    type: "int",
  })
  id!: number;

  @Column({
    type: "varchar",
    nullable: true,
})
  url!: string

  @Column({
    type: "varchar",
    nullable: true,
})
  fileName!: string

  @Column({
    type: "varchar",
    nullable: true,
  })
  fileType!: string

  @Column({
    type: "integer",
    nullable: true,
  })
  fileSize!: number

  @ManyToOne(() => Task, ( task ) => task.files)
  task!: Task
}
