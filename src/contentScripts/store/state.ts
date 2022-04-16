import { reactive } from 'vue';

export interface IState {
    selectedText: string;
    isTranslating: boolean;
    translatedText: string;
}

export const State: IState = {
    selectedText: '',
    isTranslating: false,
    translatedText: ''
}

export function createState() {
    return reactive(State);
}