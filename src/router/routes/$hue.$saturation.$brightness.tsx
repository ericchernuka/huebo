import { createFileRoute, redirect } from '@tanstack/react-router';
import { hueSchema, incrementSchema } from '../../schemas/search-params';

export const Route = createFileRoute('/$hue/$saturation/$brightness')({
  beforeLoad: ({ params }) => {
    const hue = hueSchema.parse(params.hue);
    const saturation = incrementSchema.parse(params.saturation);
    const brightness = incrementSchema.parse(params.brightness);
    throw redirect({
      search: { b: brightness, h: hue, s: saturation },
      to: '/',
    });
  },
});
