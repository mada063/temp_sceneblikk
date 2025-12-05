import { Metadata } from "next";
import { PersonvernClient } from "./PersonvernClient";

export const metadata: Metadata = {
  title: 'Personvern',
  description: 'Les om hvordan Sceneblikk behandler personopplysninger.',
  keywords: ['personvern', 'privacy', 'behandling av personopplysninger', 'Sceneblikk'],
};

export default function PersonvernPage() {
  return <PersonvernClient />;
}



