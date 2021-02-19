import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Dates, IDates } from "../common/dates.model";
import { ISeed, Seed } from "../seeds";

export interface IAuthUser extends IDates {
  id: number
  name: string;
  seeds?: ISeed[];
}

@Entity()
export class AuthUser extends Dates implements IAuthUser {
  @PrimaryColumn()
  public readonly id: number;

  @Column()
  public readonly name: string;

  @OneToMany('Seed', 'createdBy')
  public readonly seeds?: Seed[];
}