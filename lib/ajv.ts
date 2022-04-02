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

export const validateObject = <T>(schema: Record<string, unknown>, object: unknown, throwerror = false): T | undefined => {
    const isValid = ajv.validate(schema, object);

    if (isValid)
        return object as T;

    if (throwerror) {
        let messageString = 'Validation error';
        if (ajv.errors && ajv.errors[0]) {
            const path = ajv.errors[0].instancePath;
            const message = ajv.errors[0].message || '';
            messageString = `${messageString}: ${path} ${message}`;
        }
        const error = new Error(messageString);
        Object.assign(error, { validationErrors: ajv.errors });
        throw error;
    }

    return undefined;
};
