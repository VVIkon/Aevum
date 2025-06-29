export interface IContent {
  id: number
  groupid: number
  groupname: string;
  userid: number
  username: string;
  message: string;
  active: number;
  datecreate: Date;
}

export interface IMessage {
  event: string;
  authUserId?: number;
  senderId?: number;
  senderName?: string;
  contentGroupId: number | null;
  contentGroupName?: string;
  message: string | IContent[];
  dateCreate: string | Date | null;
}
