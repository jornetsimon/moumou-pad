import { Coordinate } from './coordinate';
import { Weather } from './weather';
import { WeatherMain } from './weatherMain';
import { Wind } from './wind';
import { Clouds } from './clouds';
import { System } from './system';

export interface CityWeather {
	coord: Coordinate;
	weather: Array<Weather>;
	base: string;
	main: WeatherMain;
	visibility: string;
	wind: Wind;
	clouds: Clouds;
	dt: number;
	sys: System;
	timezone: number;
	id: number;
	name: string;
	cod: number;
}
