import {PriorityLevels} from "./PriorityLevels";
import {StatusLevels} from "./StatusLevels";
import {Subtask} from "./Subtask";
import {Files} from "./Files";
import {User} from "./User";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
  ManyToMany,
  CreateDateColumn,
} from "typeorm";

@Entity({name: "task"})
export class Task {
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
    nullable: true,
  })
  description!: string;

  @Column({
    type: "enum",
    enum: PriorityLevels,
    default: PriorityLevels.LOW,
  })
  priority!: PriorityLevels;

  @Column({
    type: "enum",
    enum: StatusLevels,
    default: StatusLevels.TODO,
  })
  status!: StatusLevels;

  @Column()
  done!: boolean;

  @Column({
    type: "int",
  })
  timeSpent!: number;

  @Column({
    type: "int",
    nullable: true,
  })
  customInterval!: number;

  @CreateDateColumn({
    name: "last_execution",
  })
  lastExecution!: Date;

  @Column({
    type: "date",
  })
  deadline!: string;

  @CreateDateColumn({name: "created_at"})
  createdAt!: Date;

  userOwner: User | undefined;

  @Column({
    type: "int",
  })
  userId!: number;

  @Column("simple-array", {nullable: true})
  sharedUsersIds!: number[];

  @ManyToMany(() => User, (user) => user.tasks, {onDelete: "CASCADE"})
  @JoinColumn({name: "user_task"})
  users!: User[];

  @ManyToMany(() => Subtask, (subtask) => subtask.task, {onDelete: "CASCADE"})
  @JoinColumn({name: "subtask_id"})
  subtask!: Subtask[];

  @OneToMany(() => Files, (files) => files.task)
  files!: Files[];
}
