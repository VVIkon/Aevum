

export interface IUser {
  id: number;
  login: string;
  password: string;
  fio: string;
  email: string;
  token: string;
  salt: number;
  token_expare: number;
  roles: string[];
  active: number;
}

export interface IGroupProfile {
	id: number;
	nameGroup: string;
	typeGroup: string;
	userId: number;
	users: IUser[] | null;
	moderators: number[] | null;
	active: number;
	readOnly: number;
	dateCreate: Date;
}

export interface IRoomProfile {
	id: number;
	name: string;
	userId: number;
	groups: IGroupProfile[] | null;
	users: number[] | null;
	channels: number[] | null;
	active: number;
	dateCreate: Date;
}
