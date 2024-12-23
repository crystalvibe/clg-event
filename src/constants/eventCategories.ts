// Default initial categories and subcategories
const DEFAULT_CATEGORIES = ["Technical", "Cultural", "Sports"];

const DEFAULT_SUBCATEGORIES = {
  Technical: [
    "Hackathon",
    "Workshop",
    "Coding Competition",
    "Project Exhibition",
    "Technical Quiz",
    "Paper Presentation"
  ],
  Cultural: [
    "Dance",
    "Music",
    "Drama",
    "Fashion Show",
    "Art Exhibition",
    "Photography"
  ],
  Sports: [
    "Cricket",
    "Football",
    "Basketball",
    "Volleyball",
    "Athletics",
    "Chess"
  ]
};

// Load categories from localStorage or use defaults
const loadStoredCategories = () => {
  const stored = localStorage.getItem('eventCategories');
  return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES;
};

const loadStoredSubcategories = () => {
  const stored = localStorage.getItem('eventSubcategories');
  return stored ? JSON.parse(stored) : DEFAULT_SUBCATEGORIES;
};

// Export mutable arrays that will be updated
export let EVENT_CATEGORIES: string[] = loadStoredCategories();
export let EVENT_SUBCATEGORIES: { [key: string]: string[] } = loadStoredSubcategories();

// Function to save current state to localStorage
const saveToStorage = () => {
  localStorage.setItem('eventCategories', JSON.stringify(EVENT_CATEGORIES));
  localStorage.setItem('eventSubcategories', JSON.stringify(EVENT_SUBCATEGORIES));
};

// Function to add new categories
export const addNewCategory = (category: string) => {
  if (!EVENT_CATEGORIES.includes(category)) {
    EVENT_CATEGORIES.push(category);
    EVENT_SUBCATEGORIES[category] = [];
    saveToStorage();
  }
};

// Function to add new subcategories
export const addNewSubcategory = (category: string, subcategory: string) => {
  if (EVENT_SUBCATEGORIES[category] && subcategory.toLowerCase() !== "other") {
    if (!EVENT_SUBCATEGORIES[category].includes(subcategory)) {
      EVENT_SUBCATEGORIES[category].push(subcategory);
      saveToStorage();
    }
  }
};
