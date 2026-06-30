import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../../Services/seo.service';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqGroup {
  title: string;
  items: FaqItem[];
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit {
  openKey: string | null = '0-0';
  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update(
      'Frequently Asked Questions | Fenestration Services Calgary',
      'Find answers about window and door repair services, pricing, warranties, scheduling, foggy glass replacement, patio door repair, and commercial glazing services in Calgary.',
      'index, follow',
    );
    const script = document.createElement('script');

    script.type = 'application/ld+json';

    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: this.faqGroups.flatMap((group) =>
        group.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      ),
    });

    document.head.appendChild(script);
  }
  faqGroups: FaqGroup[] = [
    {
      title: 'General Services',
      items: [
        {
          question: 'What services do you offer?',
          answer:
            'We specialize in the repair, installation, inspection, and maintenance of residential windows and doors, including hardware replacement, weatherstripping, glass replacement, sealant renewal, alignment correction, and more.',
        },
        {
          question: 'What types of windows and doors do you service?',
          answer:
            'We service PVC, PVC-cladded, and fiberglass windows and doors, including casement, awning, tilt & turn, slider, and hung windows. We also repair patio and entry doors.',
        },
        {
          question: 'Do you offer repairs or full replacements?',
          answer:
            'We prioritize repairs to extend the life of your windows and doors. If replacement is necessary, we provide honest recommendations and suitable options.',
        },
        {
          question: 'Do you supply new windows and doors?',
          answer:
            'Typically no. We can assist with sourcing and installing new windows and doors when replacement is required, ensuring proper fit and performance.',
        },
        {
          question: 'Can you match existing window styles or finishes?',
          answer:
            'Our standard pricing is based on white and black finishes. However, we make every effort to match existing materials, colors, and finishes for partial replacements or repairs. Additional costs may apply for custom colors or finishes.',
        },
      ],
    },
    {
      title: 'Repairs & Performance',
      items: [
        {
          question: 'Can you fix windows that don’t open or close properly?',
          answer:
            'Yes. Stiff or jammed windows are one of our most common service calls. We repair or replace operators, hinges, and locking systems to restore proper function.',
        },
        {
          question: 'Can you fix drafty or leaking windows?',
          answer:
            'Yes. We identify the source of drafts or leaks and apply targeted solutions such as seal replacement, alignment correction, or hardware repair.',
        },
        {
          question: 'Do you replace glass units?',
          answer:
            'Yes. We replace failed or fogged insulated glass units using materials that meet Canadian energy-efficiency standards.',
        },
        {
          question: 'Will repairs improve energy efficiency?',
          answer:
            'Yes. Services such as resealing, weatherstripping, and glass replacement can significantly reduce drafts and improve insulation.',
        },
      ],
    },
    {
      title: 'Inspection & Maintenance',
      items: [
        {
          question: 'Do you offer inspection or maintenance plans?',
          answer:
            'Yes. We provide detailed inspection services and scheduled maintenance plans for homeowners, condos, and commercial properties.',
        },
        {
          question: 'Do you provide reports after inspections?',
          answer:
            'Yes. We can provide detailed inspection reports outlining current conditions, recommended repairs, and maintenance priorities.',
        },
      ],
    },
    {
      title: 'Products & Compatibility',
      items: [
        {
          question: 'What brands of hardware do you service?',
          answer:
            'We work with leading brands such as Roto, AmesburyTruth, Acme, and Assa Abloy. If parts are discontinued, we source compatible alternatives whenever possible.',
        },
        {
          question: 'Do you work on older or discontinued window systems?',
          answer:
            'In many cases, yes. We have experience working with older systems and can often source or fabricate suitable replacement parts.',
        },
      ],
    },
    {
      title: 'Quotes, Pricing & Process',
      items: [
        {
          question: 'How do I get a quote?',
          answer:
            'Start with an instant online quote for a quick estimate. We also offer a free on-site visit to provide a detailed written quote.',
        },
        {
          question: 'Is the on-site visit free?',
          answer:
            'Yes, our on-site assessment is completely free with no obligation to proceed.',
        },
        {
          question: 'How much does window or door repair typically cost?',
          answer:
            'Costs vary depending on the issue, window type, and parts required. We provide clear upfront pricing with no hidden fees.',
        },
        {
          question:
            'What happens if additional issues are found during service?',
          answer:
            'We will inform you immediately, explain your options, and only proceed with your approval.',
        },
      ],
    },
    {
      title: 'Scheduling & Service',
      items: [
        {
          question: 'How soon can you schedule my service?',
          answer:
            'We aim to respond within 1–2 business days and often schedule service within a few days depending on availability.',
        },
        {
          question: 'How long does a typical repair take?',
          answer:
            'Most repairs are completed in a single visit. More complex jobs may require additional time, which we will communicate in advance.',
        },
        {
          question: 'Do you work year-round, including winter?',
          answer:
            'Yes. Our team is equipped to perform work year-round using materials suitable for Canadian weather conditions.',
        },
        {
          question: 'Do you offer emergency repair services?',
          answer:
            'In certain cases, yes. Please contact us directly to check availability for urgent issues.',
        },
      ],
    },
    {
      title: 'Customer Experience & Policies',
      items: [
        {
          question: 'Do I need to be home during the service?',
          answer:
            'Yes, for most residential services, so we can review the work with you and ensure everything meets your expectations.',
        },
        {
          question: 'How can I prepare before your technician arrives?',
          answer:
            'Please ensure the work area is accessible and remove obstructions such as blinds or furniture. Providing photos in advance can help us prepare efficiently.',
        },
        {
          question: 'Do you provide a warranty?',
          answer:
            'Yes. Hardware supplied is covered by manufacturer warranties, and our workmanship is backed by a service warranty as outlined in your quote or invoice.',
        },
        {
          question: 'Are you insured and licensed?',
          answer:
            'Yes. We are fully insured and operate in compliance with local regulations.',
        },
        {
          question: 'What payment methods do you accept?',
          answer:
            'We accept major payment methods. A deposit is typically required to secure your booking, with the balance due upon completion.',
        },
        {
          question: 'What areas do you service?',
          answer:
            'We serve residential and commercial clients in Alberta. Contact us to confirm service availability in your location.',
        },
      ],
    },
  ];
  toggle(groupIndex: number, itemIndex: number): void {
    const key = `${groupIndex}-${itemIndex}`;
    this.openKey = this.openKey === key ? null : key;
  }

  isOpen(groupIndex: number, itemIndex: number): boolean {
    return this.openKey === `${groupIndex}-${itemIndex}`;
  }
}
