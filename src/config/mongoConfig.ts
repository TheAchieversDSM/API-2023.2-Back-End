import { DataSource} from 'typeorm';
import { MongoFutureTask, MongoTask } from '../models';
import { HistoricoTask } from '../models/MongoHisotirico';
import { DeleteHistoricoTask } from '../models/MongoDeleteHistorico';
import * as dotenv from "dotenv";

dotenv.config();

const entidades = [MongoTask, MongoFutureTask, HistoricoTask, DeleteHistoricoTask];
export const MongoDataSource = new DataSource({
            type: "mongodb",
            url: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority`,
            database: `${process.env.MONGO_DATABASE}`,
            synchronize: true,
            logging: false,
            entities: entidades,
        })
        
