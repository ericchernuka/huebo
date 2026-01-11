import { createFileRoute } from '@tanstack/react-router';
import Huebo from '../../components/Huebo';
import { searchParamsSchema } from '../../schemas/search-params';

export const Route = createFileRoute('/')({
  component: Huebo,
  validateSearch: searchParamsSchema,
});
