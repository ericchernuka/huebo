import { createFileRoute, redirect } from '@tanstack/react-router';
import { DEFAULT_HUE } from '../../constants';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ params: { hue: DEFAULT_HUE }, to: '/$hue' });
  },
});
