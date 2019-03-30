import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    ViewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, mergeMap } from 'rxjs/operators';
import { ApiService } from '../../services';

interface Loc {
    longitude: number;
    latitude: number;
    heading: number;
    tripId: string;
}

@Component({
    selector: 'app-follow-bus-map',
    styleUrls: ['./follow-bus-map.component.scss'],
    templateUrl: './follow-bus-map.component.pug',
})
export class FollowBusMapComponent implements AfterViewInit, OnDestroy {
    constructor(private elRef: ElementRef, private apiService: ApiService) {
        console.log(this.elRef.nativeElement);
        this.vehicleIdSubject = new BehaviorSubject(undefined);
    }

    @Input('location')
    set vehicleId(id: Loc) {
        this.vehicleIdSubject.next(id);
    }

    get vehicleId(): Loc {
        return this.vehicleIdSubject.getValue();
    }
    @ViewChild('mapcontainer') mapContainer;
    private map: L.Map;
    private vehicleIdSubject: BehaviorSubject<Loc>;
    private vehicleMarker: L.Marker;
    private updateObservable: Subscription;

    ngAfterViewInit() {
        this.map = L.map(this.mapContainer.nativeElement, { zoomControl: false }).setView([54.3364478, 10.1510508], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            accessToken: 'your.mapbox.access.token',
            attribution: undefined,
            id: 'mapbox.streets',
            maxZoom: 18,
            subdomains: ['a', 'b', 'c'],
        }).addTo(this.map);
        this.map.dragging.disable();
        this.map.touchZoom.disable();
        this.map.doubleClickZoom.disable();
        this.map.scrollWheelZoom.disable();
        this.vehicleMarker = this.createVehicleMarker();
        this.updateObservable = this.vehicleIdSubject
            .pipe(
                filter(num => num !== null))
            .subscribe((res) => {
                this.updateVehicleMarker(res);
            });
        this.vehicleIdSubject
            .pipe(
                filter(num => num !== null),
                distinctUntilChanged(),
                mergeMap(boundsa => {
                    return this.apiService.getRouteByTripId(boundsa.tripId);
                }))
            .subscribe((res) => {
                for (const key of Array.from(res.paths.keys())) {
                    const pointList: any[] = [];
                    const pathsObj = res.paths[<string>key];
                    // console.log(pathsObj);
                    for (const p of pathsObj.wayPoints) {
                        pointList.push(new L.LatLng(p.lat / 3600000, p.lon / 3600000));
                    }
                    // console.log("points", pointList);
                    const firstpolyline = L.polyline(pointList, {
                        color: pathsObj.color,
                        opacity: 0.5,
                        smoothFactor: 1,
                        weight: 3,
                    });
                    firstpolyline.addTo(this.map);
                    // console.log(res);
                }

            });

    }
    public updateVehicleMarker(vehicle: Loc): void {
        this.vehicleMarker.setLatLng({ lat: vehicle.latitude / 3600000, lng: vehicle.longitude / 3600000 });
        this.vehicleMarker.setRotationAngle(vehicle.heading - 90);
        this.map.panTo({ lat: vehicle.latitude / 3600000, lng: vehicle.longitude / 3600000, alt: 2000 }, { animate: true });
    }

    public createVehicleMarker(): L.Marker {

        const greenIcon = L.icon({
            iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
            iconSize: [24, 24], // size of the icon
            iconUrl: 'assets/iconmonstr-arrow-24.png',
            // shadowUrl: 'leaf-shadow.png',
            popupAnchor: [12, 12], // point from which the popup should open relative to the iconAnchor
            shadowAnchor: [32, 32],  // the same for the shadow
            shadowSize: [24, 24], // size of the shadow
        });
        const markerT: L.Marker = L.marker([0, 0],
            {
                icon: greenIcon,
                title: 'vehicle.name',
                zIndexOffset: 100,
            });
        // markerT.setKey(entry.id);
        markerT.addTo(this.map);
        return markerT;
    }

    public ngOnDestroy(): void {
        this.updateObservable.unsubscribe();
    }
}
