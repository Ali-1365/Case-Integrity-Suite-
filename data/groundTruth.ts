
import { LegalFrameworkItem } from '../lib/legalReferenceEngine';

const goldAudit = { verifiedAt: "2026-02-14", status: "VERIFIED" as const };

export const LEGAL_FRAMEWORK_ITEMS: LegalFrameworkItem[] = [
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
    },
    {
        id: "dl_1_1",
        label: "Diskrimineringslagen 1:1",
        type: "lagrum",
        reference: "DL",
        sfsNumber: "2008:567",
        description: "Denna lag har till ändamål att motverka diskriminering och på andra sätt främja lika rättigheter och möjligheter oavsett kön, könsöverskridande identitet eller uttryck, etnisk tillhörighet, religion eller annan trosuppfattning, funktionsnedsättning, sexuell läggning eller ålder.",
        validFrom: "2009-01-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/diskrimineringslag-2008567_sfs-2008-567/",
        version: "1.0",
        auditTrail: goldAudit
    },
    {
        id: "fmu_1",
        label: "FMU-lagen 1 §",
        type: "lagrum",
        reference: "FMU",
        sfsNumber: "2018:744",
        description: "Denna lag reglerar ansvar, befogenheter och krav vid undersökningar som Försäkringskassan får begära att den försäkrade ska genomgå när det behövs för bedömningen av frågan om ersättning eller andra förmåner enligt socialförsäkringsbalken (försäkringsmedicinska utredningar).",
        validFrom: "2019-01-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-2018744-om-forsakringsmedicinska-utredningar_sfs-2018-744/",
        version: "1.0",
        auditTrail: goldAudit
    },
    {
        id: "pl_1_1",
        label: "Patientlag 1:1",
        type: "lagrum",
        reference: "PL",
        sfsNumber: "2014:821",
        description: "Denna lag syftar till att inom hälso- och sjukvårdsverksamhet stärka och tydliggöra patientens ställning samt till att främja patientens integritet, självbestämmande och delaktighet.",
        validFrom: "2015-01-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/patientlag-2014821_sfs-2014-821/",
        version: "1.0",
        auditTrail: goldAudit
    },
    {
        id: "ysl_1",
        label: "Yrkesskadelivräntelagen 1 §",
        type: "lagrum",
        reference: "YSL",
        sfsNumber: "1977:268",
        description: "Denna lag gäller livränta och sjukpenning på grund av obligatorisk försäkring enligt lagar om försäkring för olycksfall i arbete, yrkessjukdomar, krigsförsäkring och yrkesskadeförsäkring.",
        validFrom: "1977-07-01",
        sourceUrl: "https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-1977268-om-upprakning-av-yrkesskadelivrantor-mm_sfs-1977-268/",
        version: "1.0",
        auditTrail: goldAudit
    }
];
