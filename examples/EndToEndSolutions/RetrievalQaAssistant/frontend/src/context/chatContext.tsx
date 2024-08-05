import { createContext } from "react";

import { Chat } from "@/libs/chatSDK";

interface IChatContext {
  chat: Chat;
}

const Context = createContext({
  chat: new Chat({}),
});

export { IChatContext };
export default Context;
