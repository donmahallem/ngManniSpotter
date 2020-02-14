import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ITripPassages, TripId } from '@donmahallem/trapeze-api-types';
import { merge, timer, BehaviorSubject, Observable, Subject } from 'rxjs';
import { flatMap, map, scan, switchMap, take, tap } from 'rxjs/operators';
import { ApiService } from 'src/app/services';
import { IPassageStatus, TripPassagesUtil, UpdateStatus } from './trip-util';

@Injectable()
export class TripPassagesService {
    public readonly statusObservable: Observable<IPassageStatus>;
    private readonly statusSubject: BehaviorSubject<IPassageStatus>;
    constructor(private route: ActivatedRoute,
                private apiService: ApiService) {
        this.statusSubject = new BehaviorSubject(route.snapshot.data.tripPassages);
        this.statusObservable = this.createStatusObservable();
    }

    public createStatusObservable(): Observable<IPassageStatus> {
        const refreshObservable: Observable<IPassageStatus> = this.createRefreshPollObservable(this.statusSubject);
        return merge(this.route.data.pipe(map((data) => data.tripPassages)), refreshObservable)
            .pipe(scan((acc: IPassageStatus, val: IPassageStatus, idx: number): IPassageStatus => {
                if (acc) {
                    val.failures = val.failures > 0 ? acc.failures + val.failures : 0;
                }
                return val;
            }),
                tap((newStatus: IPassageStatus): void => this.statusSubject.next(newStatus)));
    }

    public createRefreshPollObservable(statusSubject: Subject<IPassageStatus>): Observable<IPassageStatus> {
        return statusSubject.pipe(
            switchMap((status: IPassageStatus): Observable<IPassageStatus> => {
                const refreshDelay: number = (status.status === UpdateStatus.LOADED) ?
                    10000 :
                    20000;
                return this.createDelayedPassageRequest(status.tripId, refreshDelay);
            }));
    }

    public createDelayedPassageRequest(tripId: TripId, refreshDelay: number): Observable<IPassageStatus> {
        return timer(refreshDelay)
            .pipe(take(1),
                flatMap((): Observable<ITripPassages> => this.apiService.getTripPassages(tripId)),
                TripPassagesUtil.convertResponse(tripId),
                TripPassagesUtil.handleError(tripId));
    }

}