import { EnvConfig } from './env-config.interface';

const ProdConfig: EnvConfig = {
  ENV: 'PROD',
  RMMAPI: 'https://testdata.nist.gov/rmm/',
  SDPAPI: 'https://testdata.nist.gov/sdp/',
  PDRAPI: 'https://testdata.nist.gov/od/id/',
  DISTAPI: 'https://testdata.nist.gov/od/',
  METAPI: 'http://datapubtest.nist.gov/midas/',
  LANDING: 'internal'
};

export = ProdConfig;
