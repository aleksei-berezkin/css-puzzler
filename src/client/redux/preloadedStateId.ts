import { State } from './store';

export const PRELOADED_STATE_ID = '__PRELOADED_STATE__';

declare global {
    interface Window {
        [PRELOADED_STATE_ID]?: State;
    }
}
