import { User } from "src/user/entities/user.entity";
import { Chat } from "./chat.entity";

export class ChatChannel {
    constructor(
        public id: number,
        public name: string,
        public users: User[],
        public isGroup: boolean,
        public messages?: Chat[],
        public lastMessage?: Chat,
        public unReadCount: number = 0,
        public image?: string,
        public pin?: boolean,
        public mute?: boolean,
        ) { }
}