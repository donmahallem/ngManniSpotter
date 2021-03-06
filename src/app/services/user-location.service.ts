import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { catchError, debounceTime, flatMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class UserLocationService {

    public get featureAvailable(): boolean {
        return (navigator.geolocation) ? true : false;
    }

    public get location(): Position {
        return this.locationSubject.value;
    }
    public get locationErrorObservable(): Observable<PositionError> {
        return this.locationErrorSubject.asObservable();
    }
    public get locationObservable(): Observable<Position> {
        return this.locationSubject.asObservable();
    }

    private locationErrorSubject: BehaviorSubject<PositionError> = new BehaviorSubject(undefined);

    private locationSubject: BehaviorSubject<Position> = new BehaviorSubject(undefined);
    public constructor() {
        this.locationErrorObservable
            .pipe(debounceTime(30000),
                flatMap((val) =>
                    this.createPositionRequest()),
                catchError((err) => {
                    this.locationErrorSubject.next(err);
                    return EMPTY;
                }))
            .subscribe((val) => {
                this.locationErrorSubject.next(undefined);
                this.locationSubject.next(val);
            });
    }

    public createPositionRequest(timeout: number = 10000, highAccuracy: boolean = false) {
        return new Observable<any>((subscriber) => {

            const geoSuccess = (position: Position): void => {
                subscriber.next(position);
                subscriber.complete();
            };
            const geoError = (error: PositionError): void => {
                subscriber.error(error);
            };
            navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {
                enableHighAccuracy: highAccuracy,
                maximumAge: 5 * 60 * 1000, // Cache 5 minutes
                timeout,
            });
        });
    }

}
