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
	'previously-shown'?: New;
	premiere?: New;
	new?: New;
	'episode-num'?: EpisodeNum;
	date?: DisplayName;
	'star-rating'?: StarRating;
	audio?: Audio;
	subtitles?: Subtitles;
}

export type ProgrammeWithDuration = Omit<Programme, '_attributes'> & {
	_attributes: ProgrammeAttributes & { durationStr: string };
};

export interface ProgrammeAttributes {
	start: Date;
	stop: Date;
	durationHours: number;
	channel: Channel;
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

export interface New {}

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
