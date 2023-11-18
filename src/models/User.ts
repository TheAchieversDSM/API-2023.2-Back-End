import {Task} from "./Task";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from "typeorm";

@Entity({name: "user"})
export class User {
  @PrimaryGeneratedColumn({
    type: "int",
  })
  id!: number;

  @Column({
    type: "varchar",
  })
  name!: string;

  @Column({
    type: "varchar",
  })
  email!: string;

  @Column({
    type: "varchar",
  })
  password!: string;

  @ManyToMany(() => Task, (task) => task.users)
  @JoinTable({name: "user_task"})
  tasks!: Task[];
}
