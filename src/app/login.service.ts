import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Params, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LoginService {

  get relayState(): string { return this.document.location.origin }

  constructor(private router: Router, @Inject(DOCUMENT) private readonly document: any) { }

  login(loginUrl?: string): Promise<boolean> {
    console.log('logging in');
    return this.navigateTo(loginUrl || '/service/saml/login', { RelayState: this.relayState });
  }

  localLogout(): Promise<any> {
    console.log('logging out locally');
    return this.navigateTo('http://localhost:8080/saml/logout', { RelayState: this.relayState, local: true });
  }

  globalLogout(): Promise<any> {
    console.log('logging out globally');
    return this.navigateTo('http://localhost:8080/saml/logout', { RelayState: this.relayState });
  }

  private navigateTo(externalUrl: string, queryParams: Params | null): Promise<any> {
    console.log('navigating to', externalUrl, 'query params:', queryParams);
    return this.router.navigate(['/externalRedirect', { externalUrl }], { skipLocationChange: true, queryParams });
  }

}