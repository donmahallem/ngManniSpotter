import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule, MatIconModule, MatListModule, MatProgressSpinnerModule, MatToolbarModule } from '@angular/material';
import { FollowBusMapDirective } from './follow-bus-map.directive';
import { TripPassagesRoutingModule } from './trip-passages-routing.module';
import { TripPassagesComponent } from './trip-passages.component';
import { TripPassagesResolver } from './trip-passages.resolver';
@NgModule({
    declarations: [
        TripPassagesComponent,
        FollowBusMapDirective,
    ],
    imports: [
        CommonModule,
        MatIconModule,
        MatListModule,
        MatButtonModule,
        MatToolbarModule,
        MatProgressSpinnerModule,
        TripPassagesRoutingModule,
    ],
    providers: [
        TripPassagesResolver,
    ],
})
export class TripPassagesModule { }
