import {ObjectId} from "typeorm";

export interface IHistorico {
  id?: ObjectId;
  taskId: number;
  data: string;
  taskName?: string;
  owner?: number;
  user: {
    id: number;
    name: string;
  };
  campo: {
    [key: string]: {
      old: string;
      new: string;
    };
  };
}

export interface IDeleteHistorico {
  id?: ObjectId;
  taskId: number;
  date: string;
  user: {
    id: number;
    name: string;
  };
  message: string;
}

export interface IDynamicKeyData {
  [data: string]: IHistorico[];
}
