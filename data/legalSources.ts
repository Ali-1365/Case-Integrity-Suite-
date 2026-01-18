
import { LegalFrameworkItem } from '../lib/legalReferenceEngine';

const goldAudit = { verifiedAt: "2026-02-14", status: "VERIFIED" as const };

export const LEGAL_SOURCES: LegalFrameworkItem[] = [
    {
        id: "ygl_1991",
        label: "Yttrandefrihetsgrundlagen",
        type: "lagrum",
        reference: "YGL",
        sfsNumber: "1991:1469",
        description: "Grundlag till skydd för yttrandefriheten i radio, tv och liknande medier.",
        validFrom: "1992-01-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/yttrandefrihetsgrundlag-19911469_sfs-1991-1469/",
        version: "1991:1469",
        auditTrail: goldAudit
    },
    {
        id: "tf_1949",
        label: "Tryckfrihetsförordningen",
        type: "lagrum",
        reference: "TF",
        sfsNumber: "1949:105",
        description: "Grundlag rörande rätten att ge ut tryckta skrifter och allmänna handlingars offentlighet.",
        validFrom: "1949-01-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/tryckfrihetsforordning-1949105_sfs-1949-105/",
        version: "1949:105",
        auditTrail: goldAudit
    },
    {
        id: "osl_2009",
        label: "Offentlighets- och sekretesslagen",
        type: "lagrum",
        reference: "OSL",
        sfsNumber: "2009:400",
        description: "Bestämmelser om myndigheters handläggning vid registrering och utlämnande av allmänna handlingar samt tystnadsplikt.",
        validFrom: "2009-06-30",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/offentlighets--och-sekretesslag-2009400_sfs-2009-400/",
        version: "2009:400",
        auditTrail: goldAudit
    },
    {
        id: "fb_1949",
        label: "Föräldrabalken",
        type: "lagrum",
        reference: "FB",
        sfsNumber: "1949:381",
        description: "Reglerar rättsförhållandet mellan barn och föräldrar, vårdnad, umgänge och förmyndarskap.",
        validFrom: "1950-01-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/foraldrabalk-1949381_sfs-1949-381/",
        version: "1949:381",
        auditTrail: goldAudit
    },
    {
        id: "rb_1942",
        label: "Rättegångsbalken",
        type: "lagrum",
        reference: "RB",
        sfsNumber: "1942:740",
        description: "Grundläggande lag för förfarandet i de allmänna domstolarna.",
        validFrom: "1948-01-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/rattegangsbalk-1942740_sfs-1942-740/",
        version: "1942:740",
        auditTrail: goldAudit
    },
    {
        id: "sol_2025",
        label: "Socialtjänstlagen (2025)",
        type: "lagrum",
        reference: "SoL",
        sfsNumber: "2025:400",
        description: "Den nya socialtjänstlagen med fokus på förebyggande arbete och barnrättsperspektiv.",
        validFrom: "2025-07-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/socialtjanstlag-2025400_sfs-2025-400/",
        version: "2025:400",
        auditTrail: goldAudit
    },
    {
        id: "hsl_2017",
        label: "Hälso- och sjukvårdslagen",
        type: "lagrum",
        reference: "HSL",
        sfsNumber: "2017:30",
        description: "Skyldigheter för regioner och kommuner när det gäller att erbjuda hälso- och sjukvård.",
        validFrom: "2017-04-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/halso--och-sjukvardslag-201730_sfs-2017-30/",
        version: "2017:30",
        auditTrail: goldAudit
    },
    {
        id: "sfb_2010",
        label: "Socialförsäkringsbalken",
        type: "lagrum",
        reference: "SFB",
        sfsNumber: "2010:110",
        description: "Sammanhållen reglering av den svenska socialförsäkringen.",
        validFrom: "2011-01-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/socialforsakringsbalk-2010110_sfs-2010-110/",
        version: "2010:110",
        auditTrail: goldAudit
    },
    {
        id: "skl_1972",
        label: "Skadeståndslagen",
        type: "lagrum",
        reference: "SkL",
        sfsNumber: "1972:207",
        description: "Allmänna bestämmelser om skadeståndsansvar vid personskada, sakskada och ren förmögenhetsskada.",
        validFrom: "1972-01-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/skadestandslag-1972207_sfs-1972-207/",
        version: "1972:207",
        auditTrail: goldAudit
    },
    {
        id: "dl_2008",
        label: "Diskrimineringslagen",
        type: "lagrum",
        reference: "DL",
        sfsNumber: "2008:567",
        description: "Motverkar diskriminering och främjar lika rättigheter och möjligheter oavsett diskrimineringsgrund.",
        validFrom: "2009-01-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/diskrimineringslag-2008567_sfs-2008-567/",
        version: "2008:567",
        auditTrail: goldAudit
    },
    {
        id: "pl_2014",
        label: "Patientlagen",
        type: "lagrum",
        reference: "PL",
        sfsNumber: "2014:821",
        description: "Stärker och tydliggör patientens ställning samt främjar patientens integritet och självbestämmande.",
        validFrom: "2015-01-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/patientlag-2014821_sfs-2014-821/",
        version: "2014:821",
        auditTrail: goldAudit
    },
    {
        id: "lss_1993",
        label: "LSS (Stöd och service)",
        type: "lagrum",
        reference: "LSS",
        sfsNumber: "1993:387",
        description: "Rättighetslag för personer med omfattande och varaktiga funktionshinder.",
        validFrom: "1994-01-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-1993387-om-stod-och-service-till-vissa_sfs-1993-387/",
        version: "1993:387",
        auditTrail: goldAudit
    },
    {
        id: "sjukl_1991",
        label: "Sjuklönelagen",
        type: "lagrum",
        reference: "SjukL",
        sfsNumber: "1991:1047",
        description: "Regler om arbetstagares rätt till sjuklön från arbetsgivaren.",
        validFrom: "1992-01-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-19911047-om-sjuklon_sfs-1991-1047/",
        version: "1991:1047",
        auditTrail: goldAudit
    },
    {
        id: "fl_2017",
        label: "Förvaltningslagen",
        type: "lagrum",
        reference: "FL",
        sfsNumber: "2017:900",
        description: "Reglerar handläggningen av ärenden hos förvaltningsmyndigheter.",
        validFrom: "2018-07-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/forvaltningslag-2017900_sfs-2017-900/",
        version: "2017:900",
        auditTrail: goldAudit
    },
    {
        id: "bk_2018",
        label: "Barnkonventionen",
        type: "lagrum",
        reference: "BK",
        sfsNumber: "2018:1197",
        description: "FN:s konvention om barnets rättigheter som svensk lag.",
        validFrom: "2020-01-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-20181197-om-forenta-nationernas-konvention_sfs-2018-1197/",
        version: "2018:1197",
        auditTrail: goldAudit
    },
    {
        id: "fmu_2018",
        label: "FMU-lagen",
        type: "lagrum",
        reference: "FMU",
        sfsNumber: "2018:744",
        description: "Reglerar försäkringsmedicinska utredningar vid bedömning av rätt till ersättning.",
        validFrom: "2019-01-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-2018744-om-forsakringsmedicinska-utredningar_sfs-2018-744/",
        version: "2018:744",
        auditTrail: goldAudit
    },
    {
        id: "ysl_1977",
        label: "Yrkesskadelivräntelagen",
        type: "lagrum",
        reference: "YSL",
        sfsNumber: "1977:268",
        description: "Uppräkning och reglering av livräntor vid yrkesskador.",
        validFrom: "1977-07-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-1977268-om-upprakning-av-yrkesskadelivrantor-mm_sfs-1977-268/",
        version: "1977:268",
        auditTrail: goldAudit
    },
    {
        id: "bk_art_3_1",
        label: "Barnkonventionen Art. 3.1",
        type: "lagrum",
        reference: "BK",
        sfsNumber: "2018:1197",
        description: "Vid alla åtgärder som rör barn, vare sig de vidtas av offentliga eller privata sociala välfärdsinstitutioner, domstolar, administrativa myndigheter eller lagstiftande organ, ska i första hand beaktas vad som bedöms vara barnets bästa.",
        validFrom: "2020-01-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-20181197-om-forenta-nationernas-konvention_sfs-2018-1197/",
        version: "1.0",
        auditTrail: goldAudit
    }
];
