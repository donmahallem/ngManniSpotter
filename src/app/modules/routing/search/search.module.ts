import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatToolbarModule,
} from '@angular/material';
import { SearchComponent } from './search.component';
import { SearchRoutingModule } from './search-routing.module';
@NgModule({
    declarations: [
        SearchComponent
    ],
    imports: [
        CommonModule,
        SearchRoutingModule,
    ],
    providers: [
    ],
})
export class SearchModule { }
