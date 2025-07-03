export interface IContent {
  id: number
  groupid: number
  groupname: string;
  userid: number
  username: string;
  message: string;
  active: number;
  datecreate?: Date;
}

export interface INewGroup {
  roomId: number;
	nameGroup: string;
	typeGroup: 'public' | 'private' | 'hidden';
	userId: number;
	users: number[];
	moderators: number[];
	active: string|number;
	readOnly: string|number;
}

export interface IMessage {
  event: string;
  authUserId?: number;
  senderId?: number;
  senderName?: string;
  contentGroupId: number | null;
  contentGroupName?: string;
  message: string | IContent[] | INewGroup;
  dateCreate: string | Date | null;
}


export interface IActiveUser {
  id: number;
  fio: string;
}

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
  notification: { hasMessage: boolean, senderId: number} | null
}

export interface IRoomProfile {
	id: number;
	name: string;
	userId: number;
	groups: IGroupProfile[] | null;
	users: IActiveUser[] | null;
	channels: number[] | null;
	active: number;
	dateCreate: Date;
}

