import { FORMS_LOCALES } from './forms.locales';
import { deepMerge } from './merge';
import type { Locale } from './locales';

/**
 * Strings for the three forms (client components — this file ships in the
 * client bundle, so it holds only form text). Option *values* — what the
 * restaurant receives by email — stay English in both languages; only the
 * visible labels change, so the team reads every request the same way.
 */
const en = {
  common: {
    select: 'Select',
    sending: 'Sending…',
    leaveBlank: 'Leave blank',
  },
  reserve: {
    title: 'Book a *seat* at the table',
    sub: 'We’ll text or email you to confirm — usually within a few hours.',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    date: 'Date',
    time: 'Time',
    party: 'Party Size',
    guests: '{n} Guests',
    guestsMore: '7+ (please specify)',
    notes: 'Anything we should know?',
    notesPlaceholder: 'Allergies, spice level, occasion, seating preference...',
    submit: 'Request Reservation',
    sent: 'Request Sent',
    thanks: 'Thank you — we will confirm your reservation within a few hours.',
    error: 'Something went wrong — please call us or email welcome@narwhalthaihb.com.',
  },
  contact: {
    title: 'Send us a *message*',
    sub: 'Questions, suppliers, press — anything. We’ll get back to you.',
    name: 'Name',
    email: 'Email',
    phone: 'Phone (optional)',
    topic: 'What’s this about?',
    topics: {
      general: 'General question',
      reservation: 'Reservation',
      catering: 'Catering & private events',
      supplier: 'Supplier / vendor',
      press: 'Press / media',
      careers: 'Careers',
      other: 'Other',
    },
    message: 'Message',
    messagePlaceholder: 'How can we help?',
    submit: 'Send Message',
    sent: 'Message Sent',
    thanks: 'Thank you — we will reply soon.',
    error: 'Something went wrong — please email welcome@narwhalthaihb.com.',
  },
  catering: {
    title: 'Catering & *private events*',
    sub: 'Buyouts, family-style tastings, off-site catering — tell us about your event.',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    date: 'Event date',
    guests: 'Guests',
    guestOptions: { upTo10: 'Up to 10', g10: '10–25', g25: '25–50', g50: '50–100', g100: '100+' },
    type: 'Event type',
    types: {
      dinner: 'Private dinner',
      corporate: 'Corporate event',
      buyout: 'Full restaurant buyout',
      offsite: 'Off-site catering',
      other: 'Other',
    },
    where: 'Where?',
    wheres: { restaurant: 'At the restaurant', offsite: 'Off-site (we come to you)' },
    budget: 'Budget (per head or total)',
    budgetPlaceholder: 'e.g. $60 per head, or $3,000 total',
    more: 'Tell us more',
    morePlaceholder: 'Occasion, dietary needs, must-have dishes, timing...',
    submit: 'Request Catering',
    sent: 'Request Sent',
    thanks: 'Thank you — we will be in touch about your event shortly.',
    error: 'Something went wrong — please email catering@narwhalthaihb.com.',
  },
};

export type FormsDict = typeof en;

const DICTS: Record<Locale, FormsDict> = {
  en,
  vi: deepMerge(en, FORMS_LOCALES.vi),
  th: deepMerge(en, FORMS_LOCALES.th),
  zh: deepMerge(en, FORMS_LOCALES.zh),
  ko: deepMerge(en, FORMS_LOCALES.ko),
  ja: deepMerge(en, FORMS_LOCALES.ja),
  es: deepMerge(en, FORMS_LOCALES.es),
  'zh-tw': deepMerge(en, FORMS_LOCALES['zh-tw']),
};

export function forms(locale: Locale): FormsDict {
  return DICTS[locale] ?? en;
}
