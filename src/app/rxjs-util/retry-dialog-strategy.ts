import { HttpErrorResponse } from '@angular/common/http';
import { MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs';
import { flatMap, map, skipWhile } from 'rxjs/operators';
import { RetryDialogComponent } from '../modules/common/retry-dialog';

export type ErrorItem = any | HttpErrorResponse;
export type CreateDialogFuncResponse = MatDialogRef<RetryDialogComponent, boolean>;
export type CreateDialogFunc = (error?: ErrorItem) => CreateDialogFuncResponse;
export type RetryDialogStrategyFuncResponse = (errors: Observable<ErrorItem>) => Observable<true>;
export type RetryDialogStrategyFunc = (createDialog: CreateDialogFunc) => RetryDialogStrategyFuncResponse;

export const retryDialogStrategy: RetryDialogStrategyFunc = (createDialog: CreateDialogFunc) => {
    return (errors: Observable<ErrorItem>): Observable<true> => {
        let dialogOpen = false;
        return errors.pipe(skipWhile(() => dialogOpen),
            flatMap((error: ErrorItem): Observable<true> => {
                dialogOpen = true;
                const dialogRef: CreateDialogFuncResponse = createDialog(error);
                return dialogRef.afterClosed()
                    .pipe(map((tapedValue: boolean): true => {
                        dialogOpen = false;
                        if (tapedValue !== true) {
                            throw new Error();
                        }
                        return true;
                    }));
            }));
    };
};
