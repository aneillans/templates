import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import {
  DEFAULT_DEPLOYMENT_CONFIG,
  DeploymentConfig,
  mergeDeploymentConfig,
} from './deployment-config';

/**
 * Loads `/deployment-config.json` once at startup. Uses `HttpBackend` directly so the request
 * skips the interceptors: auth interceptors depend on this config, so going through them would be
 * circular.
 */
@Injectable({ providedIn: 'root' })
export class DeploymentConfigService {
  private readonly http = new HttpClient(inject(HttpBackend));

  private readonly state = signal<DeploymentConfig>(DEFAULT_DEPLOYMENT_CONFIG);

  /** Current config. Holds the defaults until `load()` completes. */
  readonly config = this.state.asReadonly();

  private request?: Observable<DeploymentConfig>;

  /** Fetches the config once and replays it to later callers. Never errors: falls back to defaults. */
  load(): Observable<DeploymentConfig> {
    this.request ??= this.http.get<unknown>('/deployment-config.json').pipe(
      catchError(() => of({})),
      map(mergeDeploymentConfig),
      tap((config) => this.state.set(config)),
      shareReplay(1),
    );
    return this.request;
  }
}
