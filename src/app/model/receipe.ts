export interface Recipe {
	_id: string;
	tastesVector: TastesVector;
	title: string;
	composition: string;
	slug: string;
	mainIngredients: Family[];
	labels: any[];
	categories: any[];
	origins: any[];
	minimumCoversRequired: number;
	roundedCoversCount: number;
	requiredTools: RequiredTool[];
	type: string;
	priority: number;
	preparationTime: number;
	preparationExtraTimePerCover: number;
	cookingTime: number;
	constituents: Constituent[];
	directions: Direction[];
	createdAt: Date;
	updatedAt: Date;
	__v: number;
	backgroundColor?: string;
	backgroundPattern: {
		color: string;
		imageUrl: string;
	};
	description: string;
	videoUrl: string;
	imageUrl: string;
	posterUrl?: string;
	imageWithBackgroundPatternUrl?: string;
	editorialPictureUrl?: string;
	isVisible: boolean;
	availabilityZones: string[];
	additionalConstituents: AdditionalConstituent[];
	partners: any[];
	family: Family;
	origin?: Family;
	seasons: string[];
	tags: Family[];
	passiveCookingTime: number;
	difficulty: number;
	eatingHabitsCompatibility: EatingHabitsCompatibility;
	normalizedTastesVector: TastesVector;
	familyAncestors: Family[];
	notTrivialRequiredToolsIds: string[];
	tagsEdito: any[];
	nutritionalFacts: RecipeNutritionalFact[];
	keywords: string[];
	likes: number;
	positiveFeedbacks: number;
	negativeFeedbacks: number;
	totalFeedbacks: number;
	aggregateRating: number;

	// custom
	smartColor: string;
}

export interface AdditionalConstituent {
	isVisible: boolean;
	_id: string;
	alternatives: any[];
	quantityPerCover: number;
	unit: Family;
	ingredient: AdditionalConstituentIngredient;
	additionalMeasures: any[];
	id: string;
}

export interface AdditionalConstituentIngredient {
	_id: string;
	updatedAt: Date;
	createdAt: Date;
	naturalUnit: Family;
	imageUrl: string;
	name: string;
	eatingHabitsCompatibility: EatingHabitsCompatibility;
	__v: number;
	alternativeUnits: AlternativeUnit[];
	isBasicIngredient: boolean;
	editorialData: EditorialData;
	id: string;
}

export interface AlternativeUnit {
	_id?: string;
	unit: Family;
	quantity: number;
	id?: string;
}

export interface Family {
	_id: string;
	updatedAt: Date;
	createdAt: Date;
	name: string;
	__v?: number;
	measurementSystemCompatibility?: MeasurementSystemCompatibility;
	abbreviations?: Abbreviation[];
	id: string;
	isNatural?: boolean;
	comments?: string;
	childrenFamilies?: any[];
}

export interface Abbreviation {
	label: string;
	digits: number;
	divisor: number;
	inverse: boolean;
	_id: string;
	minAmount: number;
	maxAmount?: number;
	id: string;
}

export interface MeasurementSystemCompatibility {
	metric: boolean;
	imperial: boolean;
	us: boolean;
}

export interface EatingHabitsCompatibility {
	vegan: boolean;
	vegetarian: boolean;
	porkless: boolean;
	dairyFree: boolean;
	glutenFree: boolean;
	fish?: boolean;
	pescatarian?: boolean;
}

export interface EditorialData {
	nutritionalFacts: EditorialDataNutritionalFact[];
	seasonality: any[];
}

export interface EditorialDataNutritionalFact {
	_id: string;
	code: ID;
	amount: number;
	portion: number;
	id: string;
}

export enum ID {
	Choavl = 'CHOAVL',
	Enerc = 'ENERC',
	Fat = 'FAT',
	Pro = 'PRO',
	Salteq = 'SALTEQ',
}

export interface Constituent {
	isOptional?: boolean;
	_id: string;
	alternatives?: Constituent[];
	quantityPerCover: number;
	unit: Family;
	ingredient: IngredientElement;
	additionalMeasures: any[];
	id: string;
}

export interface IngredientElement {
	_id: string;
	eatingHabitsCompatibility: EatingHabitsCompatibility;
	name: string;
	isBasicIngredient: boolean;
	naturalUnit: Family;
	alternativeUnits: AlternativeUnit[];
	imageUrl: string;
	createdAt: Date;
	updatedAt: Date;
	__v: number;
	editorialData: EditorialData;
	isArchived?: boolean;
	id: string;
}

export interface Direction {
	label: string;
	involvedIngredients: IngredientElement[];
	_id: string;
	needsPreviousStepsResult: boolean;
	videoTimecodeStart: number;
	id: string;
}

export interface TastesVector {
	suggestion1: number;
	suggestion2: number;
	suggestion3: number;
	suggestion4: number;
	suggestion5: number;
	suggestion6: number;
	suggestion7: number;
	suggestion8: number;
	suggestion9: number;
}

export interface RecipeNutritionalFact {
	id: ID;
	label: string;
	unit: string;
	amount: number;
}

export interface RequiredTool {
	_id: string;
	updatedAt: Date;
	createdAt: Date;
	imageUrl: string;
	name: string;
	isDefaultChecked: boolean;
	childrenTools: any[];
	isNotTrivial: boolean;
	__v: number;
	availabilityZones: string[];
	id: string;
}
