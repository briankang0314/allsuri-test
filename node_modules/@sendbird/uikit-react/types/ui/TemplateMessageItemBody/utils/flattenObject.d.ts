/**
 * Returns flattened object.
 * ex.
 * given { key-1: { key-1.1: 'value-1.1' }, key-2: 'value-2' }
 * returns { key-1.key-1.1: 'value-1.1', key-2: 'value-2' }
 */
export default function flattenObject(object: Record<string, any>): Record<string, any>;
