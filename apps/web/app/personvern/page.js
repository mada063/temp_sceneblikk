export const metadata = {
  title: 'Personvern',
  description: 'Les om hvordan Sceneblikk behandler personopplysninger.',
  keywords: ['personvern', 'privacy', 'behandling av personopplysninger', 'Sceneblikk'],
};

import { PersonvernClient } from "./PersonvernClient";

export default function PersonvernPage() {
  return <PersonvernClient />;
} 