import { IState } from './state';
import translate, { ITranslateOption } from '@/api/googleTranslateApi';
function updateSelectedText(state: IState) {
    return (selectedText: string) => {
        state.selectedText = selectedText;
    }
}

function getTranslation(state: IState) {
    return async (options: ITranslateOption) => {
        state.isTranslating = true;
        state.translatedText = '';
        // await new Promise((resolve) => {
        //     setTimeout(() => {
        //         resolve(1);
        //     }, 60 * 10 * 1000);
        // });
        const result = await translate(state.selectedText, options);
        if (result.text) {
            state.translatedText = result.text;
        }
        state.isTranslating = false;
    }
}

export function createAction(state: IState) {
    return {
        updateSelectedText: updateSelectedText(state),
        getTranslation: getTranslation(state)
    };
}