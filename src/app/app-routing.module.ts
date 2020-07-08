import { InjectionToken, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './not-found.component';

const externalUrlProvider = new InjectionToken('externalUrlRedirectResolver');

export const routes: Routes = [
    {
        path: 'externalRedirect',
        canActivate: [externalUrlProvider],
        // We need a component here because we cannot define the route otherwise
        component: NotFoundComponent,
    }
]

@NgModule({
    imports: [RouterModule.forRoot(routes, { enableTracing: false })],
    exports: [RouterModule],
    providers: [
        {
            provide: externalUrlProvider,
            useValue: (route: ActivatedRouteSnapshot) => {
                const searchParams = new URLSearchParams();
                const paramMap = route.queryParamMap;
                for (const paramName of paramMap.keys) {
                    searchParams.set(paramName, paramMap.get(paramName));
                }
                window.open(route.paramMap.get('externalUrl') + "?" + searchParams.toString(), '_self');
            }
        }
    ]
})
export class AppRoutingModule { }