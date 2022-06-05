import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GoogleApiService } from './google-api.service';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class GoogleApiInterceptor implements HttpInterceptor {
	constructor(private googleApiService: GoogleApiService) {}

	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		if (request.url.startsWith('https://www.googleapis.com/')) {
			return this.googleApiService.googleApiToken$.pipe(
				switchMap((token) => {
					if (!token) {
						throw new Error('no valid token to call Google API');
					}
					const tokenizedRequest = request.clone({
						headers: request.headers.set('Authorization', 'Bearer ' + token),
					});
					return next.handle(tokenizedRequest);
				})
			);
		}

		return next.handle(request);
	}
}
