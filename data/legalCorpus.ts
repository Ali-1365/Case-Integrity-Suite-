
import { LegalCorpus } from '../types';

export const FULL_LEGAL_CORPUS: LegalCorpus[] = [
  {
    sourceCode: 'SoL',
    sfsNumber: '2025:400',
    title: 'Socialtjänstlag',
    versionChain: ['2001:453', '2025:400'],
    paragraphs: [
      {
        id: 'sol_2025_1_1',
        chapter: 1,
        section: 1,
        text: 'Samhällets socialtjänst ska på demokratins och solidaritetens grund främja människornas ekonomiska och sociala trygghet, jämlikhet i levnadsvillkor och aktiva deltagande i samhällslivet. Socialtjänsten ska under hänsynstagande till människans ansvar för sin och andras sociala situation inriktas på att frigöra och utveckla enskildas och gruppers egna resurser. Verksamheten ska bygga på respekt för människornas självbestämmanderätt och integritet.',
        metadata: { validFrom: '2025-07-01', provenanceHash: 'sha256-a1b2c3d4' }
      },
      {
        id: 'sol_2025_1_2',
        chapter: 1,
        section: 2,
        text: 'Vid åtgärder som rör barn ska vad som är bäst för barnet vara avgörande. Vid beslut eller andra åtgärder som rör vård- eller behandlingsinsatser för barn ska vad som är bäst för barnet vara avgörande. Med barn avses varje människa under 18 år.',
        metadata: { validFrom: '2025-07-01', provenanceHash: 'sha256-e5f6g7h8' }
      }
    ]
  },
  {
    sourceCode: 'FL',
    sfsNumber: '2017:900',
    title: 'Förvaltningslag',
    versionChain: ['1986:223', '2017:900'],
    paragraphs: [
      {
        id: 'fl_2017_5',
        section: 5,
        text: 'En myndighet får endast vidta åtgärder som har stöd i rättsordningen. I sin verksamhet ska myndigheten vara saklig och opartisk. Myndigheten får inte vidta mer ingripande åtgärder än vad som är nödvändigt med hänsyn till ändamålet.',
        metadata: { validFrom: '2018-07-01', provenanceHash: 'sha256-fl5_2017' }
      },
      {
        id: 'fl_2017_6',
        section: 6,
        text: 'En myndighet ska se till att kontakterna med enskilda blir smidiga och enkla. Myndigheten ska lämna den enskilde sådan hjälp att han eller hon kan ta till vara sina intressen. Hjälpen ska ges i den utsträckning som är lämplig med hänsyn till frågans art, den enskildes behov av hjälp och myndighetens verksamhet. Den ska ges utan onödigt dröjsmål.',
        metadata: { validFrom: '2018-07-01', provenanceHash: 'sha256-fl6_2017' }
      }
    ]
  },
  {
    sourceCode: 'BK',
    sfsNumber: '2018:1197',
    title: 'Barnkonventionen',
    versionChain: ['2018:1197'],
    paragraphs: [
      {
        id: 'bk_art_3',
        section: 3,
        text: 'Vid alla åtgärder som rör barn, vare sig de vidtas av offentliga eller privata sociala välfärdsinstitutioner, domstolar, administrativa myndigheter eller lagstiftande organ, ska barnets bästa komma i främsta rummet.',
        metadata: { validFrom: '2020-01-01', provenanceHash: 'sha256-bk_art3' }
      }
    ]
  }
  // Fler lagar läggs till här enligt samma mönster...
];
