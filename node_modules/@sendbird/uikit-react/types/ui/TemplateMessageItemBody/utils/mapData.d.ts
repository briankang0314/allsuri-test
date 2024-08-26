type SourceData = Record<string, unknown>;
interface MappingParams<T> {
    template: T;
    source: SourceData;
}
export default function mapData<T extends Record<string, unknown> | Array<unknown> | string>({ template, source, }: MappingParams<T>): T;
export {};
