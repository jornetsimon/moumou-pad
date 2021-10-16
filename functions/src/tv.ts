import * as functions from 'firebase-functions';
import axios from 'axios';
import { xml2json } from 'xml-js';
import { Channel, Programme, Tv } from './model/tv.model';
import { differenceInMinutes, isWithinInterval, parse, parseISO } from 'date-fns';

const PROGRAM_URL = 'https://xmltv.ch/xmltv/xmltv-tnt.xml';

type MappedProgram = Omit<Programme, '_attributes'> & {
	_attributes: {
		start: string;
		stop: string;
		durationHours: number;
		channel: Channel | undefined;
	};
};

const getAllPrograms = async (): Promise<MappedProgram[]> => {
	const response = await axios.get<string>(PROGRAM_URL);
	const json: { tv: Tv } = JSON.parse(xml2json(response.data, { compact: true }));
	const channels = json.tv.channel;
	const programs = json.tv.programme;

	return programs.map((program): MappedProgram => {
		const format = 'yyyyMMddHHmmss XX';
		const startStr = program._attributes.start;
		const endStr = program._attributes.stop;
		const startDate = parse(startStr, format, Date.now());
		const stopDate = parse(endStr, format, Date.now());
		const channel = channels.find(
			(channel) => channel._attributes.id === program._attributes.channel
		);
		return {
			...program,
			_attributes: {
				start: startDate.toISOString() || '',
				stop: stopDate.toISOString() || '',
				durationHours:
					Math.round((differenceInMinutes(stopDate, startDate) / 60) * 10) / 10,
				channel: channel,
			},
		};
	});
};

export const primeTimePrograms = functions
	.region('europe-west1')
	.https.onCall(async (data, context): Promise<MappedProgram[]> => {
		const uid = context.auth?.uid;
		if (!uid) {
			throw new functions.https.HttpsError('failed-precondition', 'not_authenticated');
		}

		const programs = await getAllPrograms();

		return programs.filter((program) => {
			const programStart = parseISO(program._attributes.start);
			const targetRangeFrom = parseISO(data.targetRange?.from);
			const targetRangeTo = parseISO(data.targetRange?.to);
			return (
				program._attributes.durationHours > 0.75 &&
				isWithinInterval(programStart, { start: targetRangeFrom, end: targetRangeTo })
			);
		});
	});
