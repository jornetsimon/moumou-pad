import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, pipe, UnaryFunction } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { User } from 'firebase/auth';
import { Auth, authState, getAuth } from '@angular/fire/auth';

export type AuthPipeGenerator = (
	next: ActivatedRouteSnapshot,
	state: RouterStateSnapshot
) => AuthPipe;
export type AuthPipe = UnaryFunction<Observable<User | null>, Observable<boolean | string | any[]>>;

export const loggedIn: AuthPipe = map((user) => !!user);

@Injectable({
	providedIn: 'any',
})
export class AngularFireAuthGuard {
	private readonly auth: Auth;
	private user$: Observable<User | null>;

	constructor(private router: Router) {
		this.auth = getAuth();
		this.user$ = authState(this.auth);
	}

	canActivate(
		next: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		const authPipeFactory = (next.data.authGuardPipe as AuthPipeGenerator) || (() => loggedIn);

		return this.user$.pipe(
			map((user) => user ?? null),
			take(1),
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
