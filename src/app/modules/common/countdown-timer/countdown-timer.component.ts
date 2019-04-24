import { Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, timer, BehaviorSubject, Subscriber, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
@Component({
    selector: 'span[app-countdown-timer]',
    styleUrls: ['./countdown-timer.component.scss'],
    templateUrl: './countdown-timer.component.pug',
})
export class CountdownTimerComponent implements OnInit, OnDestroy {

    private timestamp = '';
    private updateSubscription: Subscription;
    private timestampSubject: BehaviorSubject<number> = new BehaviorSubject(0);

    @Input()
    public placeholder = '-';

    @Input()
    public set targetTime(timestamp: number) {
        this.timestampSubject.next(timestamp);
    }

    @HostBinding('innerHTML')
    public get text() {
        return this.timestamp;
    }

    public ngOnInit(): void {
        this.updateSubscription = combineLatest(timer(0, 200), this.timestampSubject)
            .pipe(map((value: [number, number]): string => {
                const diff: number = Math.max(value[1] - Date.now(), 0);
                if (diff <= 0) {
                    return this.placeholder;
                } else {
                    return Math.ceil(diff / 1000.0) + 's';
                }
            }),
                distinctUntilChanged())
            .subscribe(new Subscriber((val) => {
                this.timestamp = val;
            }));

    }

    public ngOnDestroy(): void {
        if (this.updateSubscription) {
            this.updateSubscription.unsubscribe();
        }
    }
}
