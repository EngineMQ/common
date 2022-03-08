import Ajv from 'ajv';

const ajv = new Ajv({
    coerceTypes: true,
    useDefaults: true,
    removeAdditional: true,
    strictNumbers: true,
    allErrors: false,
})
    .addKeyword('kind')
    .addKeyword('modifier');

export const validateObject = <T>(schema: Record<string, unknown>, obj: unknown, throwerror = false): T | null => {
    const isValid = ajv.validate(schema, obj);

    if (isValid)
        return obj as T;

    if (throwerror) {
        let message = 'Validation error';
        if (ajv.errors)
            if (ajv.errors[0]) {
                const path = ajv.errors[0].instancePath;
                const msg = ajv.errors[0].message || '';
                message = `${message}: ${path} ${msg}`;
            }
        const err = new Error(message);
        Object.assign(err, { validationErrors: ajv.errors });
        throw err;
    }

    return null;
};
