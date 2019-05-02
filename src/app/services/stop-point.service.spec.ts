import { async, TestBed } from '@angular/core/testing';
import { IStopLocation } from '@donmahallem/trapeze-api-types';
import { ApiService } from './api.service';
import { StopPointService } from './stop-point.service';
import { from } from 'rxjs';

class TestApiService {

}

describe('src/app/services/stop-point.service', () => {
    describe('StopPointService', () => {
        let stopService: StopPointService;
        let nextSpy: jasmine.Spy<InferableFunction>;
        const testLocations: IStopLocation[] = [
            <any>{
                latitude: 1,
                longitude: 2,
                shortName: '1',
            },
            <any>{
                latitude: 2,
                longitude: 2,
                shortName: '2',
            },
            <any>{
                latitude: 3,
                longitude: 45,
                shortName: '3',
            },
        ];
        beforeAll(() => {
            nextSpy = jasmine.createSpy();
        });
        beforeEach(async(() => {
            TestBed.configureTestingModule({
                providers: [StopPointService,
                    {
                        provide: ApiService,
                        useValue: new TestApiService(),
                    }],
            });
            stopService = TestBed.get(StopPointService);
        }));

        afterEach(() => {
            nextSpy.calls.reset();
        });

        describe('loadStops()', () => {
            it('needs to implemented');
        });

        describe('stopLocations', () => {
            describe('getter', () => {
                it('should get an empty list if mStopLocations is set to undefined', () => {
                    (<any>stopService).mStopLocations = undefined;
                    expect(stopService.stopLocations).toEqual([]);
                });
                it('should get an empty list if mStopLocations is a list', () => {
                    (<any>stopService).mStopLocations = testLocations;
                    expect(stopService.stopLocations).toEqual(testLocations);
                });
            });
        });
        describe('getStopLocation(stopShortName)', () => {
            it('should return if the stopShortName is unknown', () => {
                (<any>stopService).mStopLocations = [];
                expect(stopService.getStopLocation('1')).toBeUndefined();
            });
            it('should return the expected item', () => {
                (<any>stopService).mStopLocations = testLocations;
                expect(stopService.getStopLocation('1')).toEqual(testLocations[0]);
                expect(stopService.getStopLocation('3')).toEqual(testLocations[2]);
            });
        });
        describe('searchStop(stopShortName)', () => {
            describe('no stops available', () => {

            });
            describe('no known stop is provided', () => {
                it('needs to implemented');
            });
            describe('known stop is provided', () => {
                let observableSpy: jasmine.Spy<InferableFunction>;
                beforeEach(() => {
                    observableSpy = spyOnProperty(stopService, 'stopLocationsObservable');
                    observableSpy.and.returnValue(from([testLocations]));
                });
                it('should return a stop', (done) => {
                    stopService
                        .searchStop('1')
                        .subscribe(nextSpy, done, () => {
                            expect(nextSpy).toHaveBeenCalledTimes(1);
                            expect(nextSpy).toHaveBeenCalledWith(testLocations[0])
                            done();
                        });
                });
            });

        });
        describe('stopLocationsObservable', () => {
            describe('getter', () => {
                let createObservable: jasmine.Spy<InferableFunction>;
                beforeEach(() => {
                    createObservable = spyOn(stopService, 'createStopLoadObservable');
                    createObservable.and.returnValue(from([false]));
                });
                afterEach(() => {
                    createObservable.calls.reset();
                });
                describe('sharedReplay observable was already created', () => {
                    it('createStopLoadObservable should not be called', (done) => {
                        (<any>stopService).sharedReplay = from([true]);
                        stopService.stopLocationsObservable
                            .subscribe(nextSpy, () => { }, () => {
                                expect(createObservable).toHaveBeenCalledTimes(0);
                                expect(nextSpy).toHaveBeenCalledTimes(1);
                                expect(nextSpy).toHaveBeenCalledWith(true);
                                done();
                            });
                    });
                });
                describe('sharedReplay observable was not already created', () => {
                    it('createStopLoadObservable should be called', (done) => {
                        stopService.stopLocationsObservable
                            .subscribe(nextSpy, () => { }, () => {
                                expect(createObservable).toHaveBeenCalledTimes(1);
                                expect(nextSpy).toHaveBeenCalledTimes(1);
                                expect(nextSpy).toHaveBeenCalledWith(false);
                                done();
                            });
                    });
                });
            });

        });
    });
});
