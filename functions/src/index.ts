import { setGlobalOptions } from 'firebase-functions';

setGlobalOptions({ region: 'europe-west1' });

export { createUser } from './auth';

export { joinFamily } from './family';
export { approveOrDenyNewFamilyMember } from './family';

export { search as jowRecipeSearch } from './jow';
export { get as jowRecipe } from './jow';
export { featured as jowFeaturedRecipes } from './jow';

export { search } from './search';

export { primeTimePrograms } from './tv';

export { createMeal } from './meal';
export { createFamilyMeal } from './meal';

export { notionIdeas } from './notion-ideas';
