import { createFileRoute, redirect } from '@tanstack/react-router';
import { hueSchema } from '../../schemas/search-params';

export const Route = createFileRoute('/$hue')({
  beforeLoad: ({ params }) => {
    const hue = hueSchema.parse(params.hue);
    throw redirect({ search: { h: hue }, to: '/' });
  },
});
