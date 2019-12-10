import { useParams } from 'react-router-dom';

type SupportedDataTypes = 'boolean' | 'date' | 'number';
type ParamsTypeMap<T> = { [K in keyof T]: SupportedDataTypes };

const formatParser = (property: string, primitive: SupportedDataTypes) => {
  switch (primitive) {
    case 'boolean':
      return property === 'true';
    case 'date':
      return new Date(property);
    case 'number':
      return Number(property);
    default:
      throw new Error('Unsupported data type');
  }
};

const useParsedParams = <T>(types: ParamsTypeMap<T>): T => {
  const params = useParams<T>();
  const parsedKeys = {} as any;

  for (const key in types) {
    if (params[key] != null) {
      parsedKeys[key] = formatParser(params[key], types[key]);
    }
  }

  return { ...params, ...parsedKeys };
};

export default useParsedParams;
