import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EMPTY, Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { LoginService } from './login.service';

function cartesianProduct(...allEntries: string[][]): string[] {
  return allEntries.reduce<string[][]>(
    (results, entries) =>
      results
        .map(result => entries.map(entry => result.concat([entry])))
        .reduce((subResults, result) => subResults.concat(result), []),
    [[]]
  ).map(result => result.join(''));
}

const backendPrefixes = ['http://localhost:8080', '/service'];
const jwtApiPrefixes = cartesianProduct(backendPrefixes, ['/jwt/api/']);
const samlApiPrefixes = cartesianProduct(backendPrefixes, ['/saml/api/']);

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private readonly tokenHeader = "x-auth-token";

  constructor(private loginService: LoginService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = this.addAuthenticationToken(req);

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if ((!this.isBackendUrl(req.url)) || !error || error.status !== 401) {
          return throwError(error);
        }
        const locationHeader = error.headers.get('Location');
        this.loginService.login(locationHeader && this.isBackendButNotApiUrl(locationHeader) ? locationHeader : undefined);
        return EMPTY;
      })
    );
  }

  /** test if given URL is for backend */
  private isBackendUrl(url: string): boolean {
    const isBackend = !!backendPrefixes.find(start => url.startsWith(start));
    !isBackend && console.log('backend (call?', url, isBackend);
    return isBackend;
  }
  /** test if given URL is for backend (but not API) */
  private isBackendButNotApiUrl(url: string): boolean {
    const isBackend = !!backendPrefixes.find(start => url.startsWith(start)) && !this.isApiUrl(url);
    !isBackend && console.log('backend (not API) call?', url, isBackend);
    return isBackend;
  }

  /** test if given URL is for backend JWT API */
  private isJwtApiUrl(url: string): boolean {
    const isApi = !!jwtApiPrefixes.find(start => url.startsWith(start))
    !isApi && console.log('JWT api call?', url, isApi);
    return isApi;
  }

  /** test if given URL is for backend SAML API */
  private isSamlApiUrl(url: string): boolean {
    const isApi = !!samlApiPrefixes.find(start => url.startsWith(start))
    !isApi && console.log('SAML api call?', url, isApi);
    return isApi;
  }

  /** test if given URL is for backend API (JWT or SAML) */
  private isApiUrl(url: string): boolean {
    const isApi = this.isJwtApiUrl(url) || this.isSamlApiUrl(url);
    !isApi && console.log('api call?', url, isApi);
    return isApi;
  }

  private addAuthenticationToken(req: HttpRequest<any>): HttpRequest<any> {
    if (!this.isJwtApiUrl(req.url)) {
      return req;
    }
    const apiToken = localStorage.getItem('apiToken');
    if (!apiToken) {
      return req;
    }
    console.log('adding', this.tokenHeader, apiToken);
    return req.clone({
      headers: req.headers.set(this.tokenHeader, apiToken)
    });
  }

}