import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppQuery } from '../../state/app.query';
import { filter, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { CityWeather } from './model/cityWeather';
import { timer } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class WeatherService {
	constructor(private http: HttpClient, private appQuery: AppQuery) {}

	private API_KEY = '633570e4f43519c6abcb3649cabce6c4'; // steal that if you want 🤷

	private everyHour$ = timer(0, 60 * 60 * 1000);

	weather$ = this.appQuery.select('userData').pipe(
		map((user) => user?.config.city),
		filter(Boolean),
		take(1),
		switchMap((city) =>
			this.everyHour$.pipe(
				switchMap(() =>
					this.http.get<CityWeather>(
						`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.API_KEY}&units=metric&lang=fr`
					)
				),
				tap(() => console.log('Updated weather data ⛅️'))
			)
		),
		shareReplay({ bufferSize: 1, refCount: true })
	);

	weatherIconUrl$ = this.weather$.pipe(
		map((weatherData) => {
			const icon = weatherData.weather[0]?.icon;
			return icon ? `/assets/weather/icons/${icon}.svg` : undefined;
		})
	);

	temperature$ = this.weather$.pipe(map((weatherData) => Math.round(weatherData.main.temp)));
}
