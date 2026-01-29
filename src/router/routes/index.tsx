import { createFileRoute } from '@tanstack/react-router';
import { Huebo } from '../../components/huebo';
import { searchParamsSchema } from '../../schemas/search-params';

export const Route = createFileRoute('/')({
  component: Huebo,
  validateSearch: searchParamsSchema,
});
