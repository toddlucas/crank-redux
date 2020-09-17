import { Store } from "redux";

export function createTestStore(disp?: () => void, sub?: () => void, unsub?: () => void, state = {}) {
    return {
        subscribe: (listener) => {
            sub && sub();
            return () => { 
                unsub && unsub();
            };
        },
        dispatch: (action) => {
            disp && disp();
        },
        getState: () => state,
    } as Store;
}
