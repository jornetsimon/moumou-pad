import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	CanActivate,
	Router,
	RouterStateSnapshot,
	UrlTree,
} from '@angular/router';
import { Observable, of, pipe, UnaryFunction } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { User } from 'firebase/auth';
import { AppQuery } from '../../state/app.query';

export type AuthPipeGenerator = (
	next: ActivatedRouteSnapshot,
	state: RouterStateSnapshot
) => AuthPipe;
export type AuthPipe = UnaryFunction<Observable<User | null>, Observable<boolean | string | any[]>>;

export const loggedIn: AuthPipe = map((user) => !!user);

@Injectable({
	providedIn: 'any',
})
export class AngularFireAuthGuard implements CanActivate {
	constructor(private router: Router, private readonly appQuery: AppQuery) {}

	canActivate(
		next: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		const authPipeFactory = (next.data.authGuardPipe as AuthPipeGenerator) || (() => loggedIn);

		return this.appQuery.select('user').pipe(
			first(Boolean),
			authPipeFactory(next, state),
			map((can) => {
				if (typeof can === 'boolean') {
					return can;
				} else if (Array.isArray(can)) {
					return this.router.createUrlTree(can);
				} else {
					return this.router.parseUrl(can);
				}
			})
		);
	}
}

export const canActivate = (p: AuthPipeGenerator) => ({
	canActivate: [AngularFireAuthGuard],
	data: { authGuardPipe: p },
});

export const isNotAnonymous: AuthPipe = map((user) => !!user && !user.isAnonymous);
export const idTokenResult = switchMap((user: User | null) =>
	user ? user.getIdTokenResult() : of(null)
);
export const emailVerified: AuthPipe = map((user) => !!user && user.emailVerified);
export const customClaims = pipe(
	idTokenResult,
	map((idTokenResult2) => (idTokenResult2 ? idTokenResult2.claims : []))
);
export const hasCustomClaim: (claim: string) => AuthPipe = (claim) =>
	pipe(
		customClaims,
		map((claims) => claims.hasOwnProperty(claim))
	);
export const redirectUnauthorizedTo: (redirect: string | any[]) => AuthPipe = (redirect) =>
	pipe(
		loggedIn,
		map((loggedIn2) => loggedIn2 || redirect)
	);
export const redirectLoggedInTo: (redirect: string | any[]) => AuthPipe = (redirect) =>
	pipe(
		loggedIn,
		map((loggedIn2) => (loggedIn2 && redirect) || true)
	);
