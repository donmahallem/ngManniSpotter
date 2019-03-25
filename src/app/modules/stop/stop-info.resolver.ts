import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from '../../services';
import { Injectable } from '@angular/core';

@Injectable()
export class StopInfoResolver implements Resolve<any> {

    public constructor(private api: ApiService) { }
    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this.api
            .getStopDepartures(route.params['stopId']);
    }
}
