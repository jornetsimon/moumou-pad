import { setGlobalOptions } from 'firebase-functions';
import { createUser } from './auth';
import { approveOrDenyNewFamilyMember, joinFamily } from './family';
import { featured, get, search as jowSearch } from './jow';
import { createFamilyMeal, createMeal } from './meal';
import { notionIdeas } from './notion-ideas';
import { search } from './search';
import { primeTimePrograms } from './tv';

setGlobalOptions({ region: 'europe-west1' });

exports.createUser = createUser;
exports.joinFamily = joinFamily;
exports.approveOrDenyNewFamilyMember = approveOrDenyNewFamilyMember;
exports.jowFeaturedRecipes = featured;
exports.jowRecipeSearch = jowSearch;
exports.jowRecipe = get;
exports.search = search;
exports.primeTimePrograms = primeTimePrograms;
exports.createMeal = createMeal;
exports.createFamilyMeal = createFamilyMeal;
exports.notionIdeas = notionIdeas;
