import { setGlobalOptions } from 'firebase-functions';

setGlobalOptions({ region: 'europe-west1' });

export { createUser } from './auth';

export { approveOrDenyNewFamilyMember, joinFamily } from './family';

export { featured as jowFeaturedRecipes, get as jowRecipe, search as jowRecipeSearch } from './jow';

export { search } from './search';

export { primeTimePrograms } from './tv';

export { createFamilyMeal, createMeal } from './meal';

export { notionIdeas } from './notion-ideas';
