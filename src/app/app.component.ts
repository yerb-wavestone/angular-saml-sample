import { HttpClient } from "@angular/common/http";
import { Component } from '@angular/core';
import { ApiToken } from "./ApiToken";
import { LoginService } from "./login.service";

type LogoutType = 'local' | 'global';
type ApiType = 'jwt' | 'saml';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  jwtToken?: string;
  jwtApiResult?: unknown;

  samlApiResult?: unknown;

  authenticated?: boolean;
  logoutType?: LogoutType;

  constructor(private loginService: LoginService, private http: HttpClient) { }

  checkJwtToken() {
    this.http.get('/service/jwt/token', { observe: 'response' })
      .subscribe(res => this.handleJwtToken(res.body as ApiToken))
  }

  private handleJwtToken(apiToken: ApiToken): void {
    this.authenticated = true;
    this.jwtToken = apiToken.token.substring(0, 10) + '...';
    localStorage.setItem('apiToken', apiToken.token);
    this.callJwtProtectedApi();
  }

  callJwtProtectedApi() {
    this.http.get('/service/jwt/api/mycontroller', { observe: 'response' })
      .subscribe(res => this.processApiResult('jwt', res.body));
  }

  callSamlProtectedApi() {
    this.http.get('/service/saml/api/mycontroller', { observe: 'response' })
      .subscribe(res => this.processApiResult('saml', res.body));
  }

  private processApiResult(type: ApiType, result?: unknown) {
    this.authenticated = true;
    if (type === 'jwt') {
      this.jwtApiResult = result;
    } else {
      this.samlApiResult = result;
    }
  }

  localLogout() {
    this.subscribeLogout(this.loginService.localLogout(), 'local');
  }

  globalLogout() {
    this.subscribeLogout(this.loginService.globalLogout(), 'global');
  }

  private subscribeLogout(logout$: Promise<any>, type: LogoutType) {
    logout$.then(
      () => this.logoutType = type,
      err => console.error(err)
    );
  }

}
