
import { LegalSourceCode } from '../types';

export interface IngestItem {
  id: string;
  sourceCode: LegalSourceCode;
  sfsNumber: string;
  title: string;
  rawFile: string;
  targetFile: string;
  versionChain: string[];
  validFrom: string;
}

/**
 * FMJAM Ingest Configuration v.7.4.0
 * Deterministisk mapping för 17 juridiska ramverk.
 */
export const INGEST_CONFIG: IngestItem[] = [
  { id: 'ygl_1991', sourceCode: 'YGL', sfsNumber: '1991:1469', title: 'Yttrandefrihetsgrundlag', rawFile: 'ygl_1991_1469.txt', targetFile: 'ygl_1991_1469.json', versionChain: ['1991:1469'], validFrom: '1992-01-01' },
  { id: 'tf_1949', sourceCode: 'TF', sfsNumber: '1949:105', title: 'Tryckfrihetsförordning', rawFile: 'tf_1949_105.txt', targetFile: 'tf_1949_105.json', versionChain: ['1949:105'], validFrom: '1949-01-01' },
  { id: 'osl_2009', sourceCode: 'OSL', sfsNumber: '2009:400', title: 'Offentlighets- och sekretesslag', rawFile: 'osl_2009_400.txt', targetFile: 'osl_2009_400.json', versionChain: ['2009:400'], validFrom: '2009-06-30' },
  { id: 'fb_1949', sourceCode: 'FB', sfsNumber: '1949:381', title: 'Föräldrabalk', rawFile: 'fb_1949_381.txt', targetFile: 'fb_1949_381.json', versionChain: ['1949:381'], validFrom: '1950-01-01' },
  { id: 'rb_1942', sourceCode: 'RB', sfsNumber: '1942:740', title: 'Rättegångsbalk', rawFile: 'rb_1942_740.txt', targetFile: 'rb_1942_740.json', versionChain: ['1942:740'], validFrom: '1948-01-01' },
  { id: 'sol_2025', sourceCode: 'SoL', sfsNumber: '2025:400', title: 'Socialtjänstlag', rawFile: 'sol_2025_400.txt', targetFile: 'sol_2025_400.json', versionChain: ['2001:453', '2025:400'], validFrom: '2025-07-01' },
  { id: 'hsl_2017', sourceCode: 'HSL', sfsNumber: '2017:30', title: 'Hälso- och sjukvårdslag', rawFile: 'hsl_2017_30.txt', targetFile: 'hsl_2017_30.json', versionChain: ['1982:763', '2017:30'], validFrom: '2017-04-01' },
  { id: 'sfb_2010', sourceCode: 'SFB', sfsNumber: '2010:110', title: 'Socialförsäkringsbalk', rawFile: 'sfb_2010_110.txt', targetFile: 'sfb_2010_110.json', versionChain: ['2010:110'], validFrom: '2011-01-01' },
  { id: 'skl_1972', sourceCode: 'SkL', sfsNumber: '1972:207', title: 'Skadeståndslag', rawFile: 'skl_1972_207.txt', targetFile: 'skl_1972_207.json', versionChain: ['1972:207'], validFrom: '1972-07-01' },
  { id: 'dl_2008', sourceCode: 'DL', sfsNumber: '2008:567', title: 'Diskrimineringslag', rawFile: 'dl_2008_567.txt', targetFile: 'dl_2008_567.json', versionChain: ['2008:567'], validFrom: '2009-01-01' },
  { id: 'pl_2014', sourceCode: 'PL', sfsNumber: '2014:821', title: 'Patientlag', rawFile: 'pl_2014_821.txt', targetFile: 'pl_2014_821.json', versionChain: ['2014:821'], validFrom: '2015-01-01' },
  { id: 'lss_1993', sourceCode: 'LSS', sfsNumber: '1993:387', title: 'Lag om stöd och service till vissa funktionshindrade', rawFile: 'lss_1993_387.txt', targetFile: 'lss_1993_387.json', versionChain: ['1993:387'], validFrom: '1994-01-01' },
  { id: 'sjukl_1991', sourceCode: 'SjukL', sfsNumber: '1991:1047', title: 'Lag om sjuklön', rawFile: 'sjukl_1991_1047.txt', targetFile: 'sjukl_1991_1047.json', versionChain: ['1991:1047'], validFrom: '1992-01-01' },
  { id: 'fl_2017', sourceCode: 'FL', sfsNumber: '2017:900', title: 'Förvaltningslag', rawFile: 'fl_2017_900.txt', targetFile: 'fl_2017_900.json', versionChain: ['1986:223', '2017:900'], validFrom: '2018-07-01' },
  { id: 'bk_2018', sourceCode: 'BK', sfsNumber: '2018:1197', title: 'Barnkonventionen', rawFile: 'bk_2018_1197.txt', targetFile: 'bk_2018_1197.json', versionChain: ['2018:1197'], validFrom: '2020-01-01' },
  { id: 'fmu_2018', sourceCode: 'FMU', sfsNumber: '2018:744', title: 'Lag om försäkringsmedicinska utredningar', rawFile: 'fmu_2018_744.txt', targetFile: 'fmu_2018_744.json', versionChain: ['2018:744'], validFrom: '2019-01-01' },
  { id: 'ysl_1977', sourceCode: 'YSL', sfsNumber: '1977:268', title: 'Lag om uppräkning av yrkesskadelivräntor m.m.', rawFile: 'ysl_1977_268.txt', targetFile: 'ysl_1977_268.json', versionChain: ['1977:268'], validFrom: '1977-07-01' },
  { id: 'rf_1974', sourceCode: 'RF', sfsNumber: '1974:152', title: 'Regeringsformen', rawFile: 'rf_1974_152.txt', targetFile: 'rf_1974_152.json', versionChain: ['1974:152'], validFrom: '1974-01-01' },
  { id: 'brb_1962', sourceCode: 'BrB', sfsNumber: '1962:700', title: 'Brottsbalken', rawFile: 'brb_1962_700.txt', targetFile: 'brb_1962_700.json', versionChain: ['1962:700'], validFrom: '1965-01-01' },
  { id: 'lvu_1990', sourceCode: 'LVU', sfsNumber: '1990:52', title: 'Lag om vård av unga', rawFile: 'lvu_1990_52.txt', targetFile: 'lvu_1990_52.json', versionChain: ['1990:52'], validFrom: '1990-07-01' },
  { id: 'lvm_1988', sourceCode: 'LVM', sfsNumber: '1988:870', title: 'Lag om vård av missbrukare', rawFile: 'lvm_1988_870.txt', targetFile: 'lvm_1988_870.json', versionChain: ['1988:870'], validFrom: '1989-01-01' },
  { id: 'ls_2017', sourceCode: 'LS', sfsNumber: '2017:612', title: 'Lag om samverkan vid utskrivning', rawFile: 'lag_2017_612.txt', targetFile: 'lag_2017_612.json', versionChain: ['2017:612'], validFrom: '2018-01-01' },
  { id: 'kl_2017', sourceCode: 'KL', sfsNumber: '2017:725', title: 'Kommunallag', rawFile: 'kl_2017_725.txt', targetFile: 'kl_2017_725.json', versionChain: ['2017:725'], validFrom: '2018-01-01' },
];
