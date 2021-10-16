export interface Tv {
	_attributes: TvAttributes;
	channel: Channel[];
	programme: Programme[];
}

export interface TvAttributes {
	'source-info-url': string;
	'source-data-url': string;
	'generator-info-name': string;
	'generator-info-url': string;
}

export interface Channel {
	_attributes: ChannelAttributes;
	'display-name': DisplayName;
	icon: Icon;
}

export interface ChannelAttributes {
	id: string;
}

export interface DisplayName {
	_text: string;
}

export interface Icon {
	_attributes: IconAttributes;
}

export interface IconAttributes {
	src: string;
}

export interface Programme {
	_attributes: ProgrammeAttributes;
	title: DisplayName;
	'sub-title'?: DisplayName;
	desc?: Category;
	category?: Category;
	length: Length;
	icon?: Icon;
	rating: Rating;
	'previously-shown'?: boolean;
	premiere?: boolean;
	new?: boolean;
	'episode-num'?: EpisodeNum;
	date?: DisplayName;
	'star-rating'?: StarRating;
	audio?: Audio;
	subtitles?: Subtitles;
}

export interface ProgrammeAttributes {
	start: string;
	stop: string;
	channel: string;
}

export interface Audio {
	stereo: DisplayName;
}

export interface Category {
	_attributes: CategoryAttributes;
	_text: string;
}

export interface CategoryAttributes {
	lang: Lang;
}

export enum Lang {
	Fr = 'fr',
}

export interface EpisodeNum {
	_attributes: EpisodeNumAttributes;
	_text: string;
}

export interface EpisodeNumAttributes {
	system: System;
}

export enum System {
	Csa = 'CSA',
	XmltvNS = 'xmltv_ns',
}

export interface Length {
	_attributes: LengthAttributes;
	_text: string;
}

export interface LengthAttributes {
	units: Units;
}

export enum Units {
	Hours = 'hours',
	Minutes = 'minutes',
}

export interface Rating {
	_attributes: EpisodeNumAttributes;
	value: DisplayName;
	icon?: Icon;
}

export interface StarRating {
	value: DisplayName;
}

export interface Subtitles {
	_attributes: SubtitlesAttributes;
	language: DisplayName;
}

export interface SubtitlesAttributes {
	type: string;
}
