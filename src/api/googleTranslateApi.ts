import languages from "./languages";

class CustomError extends Error {
    public code: any = null;
    constructor(message?: string, code?: any, options?: ErrorOptions) {
        super(message, options);
        this.code = code;
    }
}

export interface ITranslateOption {
    from?: string;
    to?: string;
    raw?: boolean;
}

const translate = async (text: string, opts: ITranslateOption = {}) => {
    let e;
    [opts.from, opts.to].forEach(function (lang) {
        if (lang && !languages.isSupported(lang)) {
            e = new CustomError();
            e.code = 400;
            e.message = 'The language \'' + lang + '\' is not supported';
        }
    });

    if (e) {
        throw e;
    }

    opts.from = opts.from || 'auto';
    opts.to = opts.to || 'en';

    opts.from = languages.getCode(opts.from);
    opts.to = languages.getCode(opts.to);

    const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&ie=UTF-8&oe=UTF-8&dt=bd&dt=ex&dt=ld&dt=md&dt=rw&dt=rm&dt=ss&dt=t&dt=at&dt=qc&sl=${opts.from}&tl=${opts.to}&hl=${opts.to}&q=${text}`
    );

    if (!response.ok) {
        const e = new CustomError();
        e.code='BAD_NETWORK';
        throw e;
    }

    if (response.status !== 200) {
        const e = new CustomError();
        e.code='BAD_REQUEST';
        throw e;
    }

    let result = {
        text: '',
        from: {
            language: {
                didYouMean: false,
                iso: ''
            },
            text: {
                autoCorrected: false,
                value: '',
                didYouMean: false
            }
        },
        raw: ''
    };

    const content = await response.text();
    if (opts.raw) {
        result.raw = content;
    }
    const body = JSON.parse(content);
    body[0].forEach(function (obj: string[]) {
        if (obj[0]) {
            result.text += obj[0];
        }
    });

    if (body[2] === body[8][0][0]) {
        result.from.language.iso = body[2];
    } else {
        result.from.language.didYouMean = true;
        result.from.language.iso = body[8][0][0];
    }

    if (body[7] && body[7][0]) {
        let str = body[7][0];

        str = str.replace(/<b><i>/g, '[');
        str = str.replace(/<\/i><\/b>/g, ']');

        result.from.text.value = str;

        if (body[7][5] === true) {
            result.from.text.autoCorrected = true;
        } else {
            result.from.text.didYouMean = true;
        }
    }

    return result;
};

export default translate;
