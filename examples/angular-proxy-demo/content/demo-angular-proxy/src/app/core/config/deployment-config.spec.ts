import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_DEPLOYMENT_CONFIG, mergeDeploymentConfig } from './deployment-config';
import { DeploymentConfigService } from './deployment-config.service';

describe('mergeDeploymentConfig', () => {
  it('returns the defaults for empty or invalid input', () => {
    expect(mergeDeploymentConfig({})).toEqual(DEFAULT_DEPLOYMENT_CONFIG);
    expect(mergeDeploymentConfig(null)).toEqual(DEFAULT_DEPLOYMENT_CONFIG);
    expect(mergeDeploymentConfig('nope')).toEqual(DEFAULT_DEPLOYMENT_CONFIG);
  });

  it('overrides only known keys with non-empty strings', () => {
    const merged = mergeDeploymentConfig({ apiBaseUrl: ' /edge/api ', unknown: 'x', other: 1 });
    expect(merged.apiBaseUrl).toBe('/edge/api');
    expect('unknown' in merged).toBe(false);
  });

  it('keeps the default when the override is blank', () => {
    expect(mergeDeploymentConfig({ apiBaseUrl: '  ' }).apiBaseUrl).toBe(
      DEFAULT_DEPLOYMENT_CONFIG.apiBaseUrl,
    );
  });
});

describe('DeploymentConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('requests the file once and exposes the merged result', async () => {
    const service = TestBed.inject(DeploymentConfigService);
    const httpMock = TestBed.inject(HttpTestingController);

    const first = firstValueFrom(service.load());
    const second = firstValueFrom(service.load());
    httpMock.expectOne('/deployment-config.json').flush({ apiBaseUrl: '/v2' });

    expect((await first).apiBaseUrl).toBe('/v2');
    expect((await second).apiBaseUrl).toBe('/v2');
    expect(service.config().apiBaseUrl).toBe('/v2');
    httpMock.verify();
  });

  it('falls back to the defaults when the file is missing', async () => {
    const service = TestBed.inject(DeploymentConfigService);
    const httpMock = TestBed.inject(HttpTestingController);

    const result = firstValueFrom(service.load());
    httpMock
      .expectOne('/deployment-config.json')
      .flush(null, { status: 404, statusText: 'Not Found' });

    expect(await result).toEqual(DEFAULT_DEPLOYMENT_CONFIG);
  });
});
