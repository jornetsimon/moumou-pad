import { Injectable } from '@angular/core';
import {
	HttpEvent,
	HttpHandler,
	HttpHeaders,
	HttpInterceptor,
	HttpRequest,
} from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { GoogleApiService } from './google-api.service';
import { AppQuery } from '../../../state/app.query';
import { catchError, debounceTime, first, switchMap, take, tap } from 'rxjs/operators';

@Injectable()
export class GoogleApiInterceptor implements HttpInterceptor {
	constructor(private googleApiService: GoogleApiService, private appQuery: AppQuery) {
		this.requestNewAccessToken$$
			.pipe(
				debounceTime(150),
				tap(() => {
					this.googleApiService.setAccessToken(undefined);
					this.googleApiService.token_client.requestAccessToken({
						prompt: '',
					});
				})
			)
			.subscribe();
	}

	readonly accessToken$ = this.googleApiService.accessToken$;

	readonly requestNewAccessToken$$ = new Subject<void>();

	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		if (request.url.includes('googleapis.com')) {
			return this.accessToken$
				.pipe(
					take(1),
					switchMap((token) => {
						console.log('Attaching access token ' + token);
						return next.handle(this.addTokenHeader(request, token));
					})
				)
				.pipe(
					catchError((err, caught) => {
						if (err.status == 401) {
							console.log(`Access token is expired. Retrying...`);
							this.requestNewAccessToken$$.next();

							return this.accessToken$.pipe(
								first(Boolean),
								switchMap((token) => {
									console.log('Second try with token ', token);
									return next.handle(
										this.addTokenHeader(request, token as string)
									);
								})
							);
						}
						return caught;
					})
				);
		}

		// If the request URL doesn't contain 'googleapis.com', forward the original request
		return next.handle(request);
	}

	private addTokenHeader(request: HttpRequest<unknown>, token?: string) {
		const newHeaders = new HttpHeaders().set('Authorization', `Bearer ${token}`);
		return request.clone({
			headers: newHeaders,
		});
	}
}
