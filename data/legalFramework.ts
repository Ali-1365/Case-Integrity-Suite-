
export interface LegalFrameworkIndexEntry {
  id: string;
  label: string;
  type: 'lag' | 'regelverk';
  sfsNumber?: string;
  shortName: string;
  corpusFile: string;
  auditTrail: { status: 'PENDING' | 'VERIFIED' | 'OBSOLETE' };
}

export const legalFrameworkIndex: LegalFrameworkIndexEntry[] = [
  {
    "id": "ygl_1991",
    "label": "Yttrandefrihetsgrundlagen (1991:1469)",
    "type": "lag",
    "sfsNumber": "1991:1469",
    "shortName": "YGL",
    "corpusFile": "ygl_1991_1469.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "tf_1949",
    "label": "Tryckfrihetsförordningen (1949:105)",
    "type": "lag",
    "sfsNumber": "1949:105",
    "shortName": "TF",
    "corpusFile": "tf_1949_105.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "osl_2009",
    "label": "Offentlighets- och sekretesslag (2009:400)",
    "type": "lag",
    "sfsNumber": "2009:400",
    "shortName": "OSL",
    "corpusFile": "osl_2009_400.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "fb_1949",
    "label": "Föräldrabalk (1949:381)",
    "type": "lag",
    "sfsNumber": "1949:381",
    "shortName": "FB",
    "corpusFile": "fb_1949_381.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "rb_1942",
    "label": "Rättegångsbalk (1942:740)",
    "type": "lag",
    "sfsNumber": "1942:740",
    "shortName": "RB",
    "corpusFile": "rb_1942_740.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "sol_2025",
    "label": "Socialtjänstlag (2025:400)",
    "type": "lag",
    "sfsNumber": "2025:400",
    "shortName": "SoL",
    "corpusFile": "sol_2025_400.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "hsl_2017",
    "label": "Hälso- och sjukvårdslag (2017:30)",
    "type": "lag",
    "sfsNumber": "2017:30",
    "shortName": "HSL",
    "corpusFile": "hsl_2017_30.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "sfb_2010",
    "label": "Socialförsäkringsbalk (2010:110)",
    "type": "lag",
    "sfsNumber": "2010:110",
    "shortName": "SFB",
    "corpusFile": "sfb_2010_110.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "skl_1972",
    "label": "Skadeståndslag (1972:207)",
    "type": "lag",
    "sfsNumber": "1972:207",
    "shortName": "SkL",
    "corpusFile": "skl_1972_207.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "dl_2008",
    "label": "Diskrimineringslag (2008:567)",
    "type": "lag",
    "sfsNumber": "2008:567",
    "shortName": "DL",
    "corpusFile": "dl_2008_567.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "pl_2014",
    "label": "Patientlag (2014:821)",
    "type": "lag",
    "sfsNumber": "2014:821",
    "shortName": "PL",
    "corpusFile": "pl_2014_821.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "lss_1993",
    "label": "Lag (1993:387) om stöd och service till vissa funktionshindrade",
    "type": "lag",
    "sfsNumber": "1993:387",
    "shortName": "LSS",
    "corpusFile": "lss_1993_387.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "sjukl_1991",
    "label": "Lag (1991:1047) om sjuklön",
    "type": "lag",
    "sfsNumber": "1991:1047",
    "shortName": "SjukL",
    "corpusFile": "sjukl_1991_1047.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "fl_2017",
    "label": "Förvaltningslag (2017:900)",
    "type": "lag",
    "sfsNumber": "2017:900",
    "shortName": "FL",
    "corpusFile": "fl_2017_900.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "bk_2018",
    "label": "Barnkonventionen (SFS 2018:1197)",
    "type": "lag",
    "sfsNumber": "2018:1197",
    "shortName": "BK",
    "corpusFile": "bk_2018_1197.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "fmu_2018",
    "label": "Lag (2018:744) om försäkringsmedicinska utredningar",
    "type": "lag",
    "sfsNumber": "2018:744",
    "shortName": "FMU",
    "corpusFile": "fmu_2018_744.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "ysl_1977",
    "label": "Lag (1977:268) om uppräkning av yrkesskadelivräntor m.m.",
    "type": "lag",
    "sfsNumber": "1977:268",
    "shortName": "YSL",
    "corpusFile": "ysl_1977_268.json",
    "auditTrail": { "status": "PENDING" }
  },
  {
    "id": "rf_1974",
    "label": "Regeringsformen (1974:152)",
    "type": "lag",
    "sfsNumber": "1974:152",
    "shortName": "RF",
    "corpusFile": "rf_1974_152.json",
    "auditTrail": { "status": "VERIFIED" }
  },
  {
    "id": "brb_1962",
    "label": "Brottsbalken (1962:700)",
    "type": "lag",
    "sfsNumber": "1962:700",
    "shortName": "BrB",
    "corpusFile": "brb_1962_700.json",
    "auditTrail": { "status": "VERIFIED" }
  },
  {
    "id": "lvu_1990",
    "label": "Lag (1990:52) om vård av unga",
    "type": "lag",
    "sfsNumber": "1990:52",
    "shortName": "LVU",
    "corpusFile": "lvu_1990_52.json",
    "auditTrail": { "status": "VERIFIED" }
  },
  {
    "id": "lvm_1988",
    "label": "Lag (1988:870) om vård av missbrukare",
    "type": "lag",
    "sfsNumber": "1988:870",
    "shortName": "LVM",
    "corpusFile": "lvm_1988_870.json",
    "auditTrail": { "status": "VERIFIED" }
  },
  {
    "id": "ls_2017",
    "label": "Lag (2017:612) om samverkan vid utskrivning",
    "type": "lag",
    "sfsNumber": "2017:612",
    "shortName": "LS",
    "corpusFile": "lag_2017_612.json",
    "auditTrail": { "status": "VERIFIED" }
  },
  {
    "id": "praxis",
    "label": "Vägledande Praxis (HFD, RÅ, JO, KR)",
    "type": "regelverk",
    "shortName": "PRAXIS",
    "corpusFile": "praxis.json",
    "auditTrail": { "status": "VERIFIED" }
  }
];
