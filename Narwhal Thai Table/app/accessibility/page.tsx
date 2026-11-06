import AccessibilityPage, { accessibilityMetadata } from '@/components/pages/AccessibilityPage';

/* /accessibility — the statement + the guest's own switches. Twins: app/[locale]/accessibility. */
export const metadata = accessibilityMetadata('en');

export default function Page() {
  return <AccessibilityPage locale="en" />;
}
