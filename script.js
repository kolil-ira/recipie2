const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');
const savedMealsList = document.getElementById('saved-meals-list');

// Load saved meals on page load
document.addEventListener('DOMContentLoaded', loadSavedMeals);

// Event listeners
searchBtn.addEventListener('click', getMealList);
mealList.addEventListener('click', getMealRecipe);
recipeCloseBtn.addEventListener('click', hideModal);
savedMealsList.addEventListener('click', handleSavedMealAction); // Modified for handling actions in saved meals

// Function to load saved 
function loadSavedMeals() {
    const savedMeals = JSON.parse(localStorage.getItem('savedMeals')) || [];
    savedMeals.forEach(meal => {
        displaySavedMeal(meal);
    });
}

// Function to save a meal 
function saveMeal(e) {
    if (e.target.classList.contains('save-btn')) {
        const mealTitle = mealDetailsContent.querySelector('.recipe-title').textContent;
        const mealCategory = mealDetailsContent.querySelector('.recipe-category').textContent;
        const mealImage = mealDetailsContent.querySelector('.recipe-meal-img img').src;
        const mealId = mealDetailsContent.getAttribute('data-meal-id'); // Save meal ID

        const savedMeal = {
            title: mealTitle,
            category: mealCategory,
            image: mealImage,
            id: mealId // Include meal ID
        };

        // Save meal to localStorage
        let savedMeals = JSON.parse(localStorage.getItem('savedMeals')) || [];
        savedMeals.push(savedMeal);
        localStorage.setItem('savedMeals', JSON.stringify(savedMeals));

        displaySavedMeal(savedMeal);
    }
}

// Function to display a saved meal 
function displaySavedMeal(meal) {
    const mealItem = document.createElement('div');
    mealItem.classList.add('saved-meal-item');
    mealItem.innerHTML = `
        <div class="saved-meal-img">
            <img src="${meal.image}" alt="${meal.title}">
        </div>
        <div class="saved-meal-info">
            <h3>${meal.title}</h3>
            <p>${meal.category}</p>
            <button class="btn remove-btn" aria-label="Remove meal">Remove</button>
            <button class="btn get-recipe-btn" data-id="${meal.id}" aria-label="Get recipe">Get Recipe</button>
        </div>
    `;
    savedMealsList.appendChild(mealItem);
}

//  (Remove or Get Recipe)
function handleSavedMealAction(e) {
    if (e.target.classList.contains('remove-btn')) {
        removeSavedMeal(e);
    } else if (e.target.classList.contains('get-recipe-btn')) {
        getSavedMealRecipe(e);
    }
}

// Function to remove a saved meal
function removeSavedMeal(e) {
    const mealItem = e.target.closest('.saved-meal-item');
    const mealTitle = mealItem.querySelector('h3').textContent;

    // Remove from localStorage
    let savedMeals = JSON.parse(localStorage.getItem('savedMeals')) || [];
    savedMeals = savedMeals.filter(meal => meal.title !== mealTitle);
    localStorage.setItem('savedMeals', JSON.stringify(savedMeals));

    // Remove meal from the DOM
    savedMealsList.removeChild(mealItem);
}

// get recipe for saved meal
function getSavedMealRecipe(e) {
    const mealId = e.target.getAttribute('data-id');

    showLoading(mealDetailsContent); // Show loading in modal

    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
        .then(response => response.json())
        .then(data => {
            mealRecipeModal(data.meals);
        })
        .catch(() => {
            mealDetailsContent.innerHTML = "<p>Failed to fetch recipe details. Please try again later.</p>";
        })
        .finally(() => hideLoading(mealDetailsContent));
}

// show loading indicator
function showLoading(target) {
    const loadingMessage = document.createElement('p');
    loadingMessage.textContent = 'Loading...';
    loadingMessage.classList.add('loading-message');
    target.appendChild(loadingMessage);
}

//  hide loading indicator
function hideLoading(target) {
    const loadingMessage = target.querySelector('.loading-message');
    if (loadingMessage) {
        target.removeChild(loadingMessage);
    }
}

// display error messages
function displayError(target, message) {
    target.innerHTML = `<p>${message}</p>`;
}

//show modal
function showModal() {
    const parentElement = mealDetailsContent.parentElement;
    parentElement.style.opacity = 0;
    parentElement.classList.add('showRecipe');
    let fadeEffect = setInterval(() => {
        if (!parentElement.style.opacity || parseFloat(parentElement.style.opacity) < 1) {
            parentElement.style.opacity = (parseFloat(parentElement.style.opacity) || 0) + 0.1;
        } else {
            clearInterval(fadeEffect);
        }
    }, 30);
}

// hide modal
function hideModal() {
    const parentElement = mealDetailsContent.parentElement;
    let fadeEffect = setInterval(() => {
        if (parseFloat(parentElement.style.opacity) > 0) {
            parentElement.style.opacity = parseFloat(parentElement.style.opacity) - 0.1;
        } else {
            clearInterval(fadeEffect);
            parentElement.classList.remove('showRecipe');
        }
    }, 30);
}

// Function to get meal list based on search input
function getMealList() {
    let searchInputTxt = document.getElementById('search-input').value.trim();

    if (!searchInputTxt) {
        displayError(mealList, 'Please enter an ingredient to search for meals.');
        mealList.classList.add('notFound');
        return;
    }

    mealList.innerHTML = '';
    showLoading(mealList);

    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`)
        .then(response => response.json())
        .then(data => {
            hideLoading(mealList);
            let html = "";
            if (data.meals) {
                data.meals.forEach(meal => {
                    html += `
                        <div class="meal-item" data-id="${meal.idMeal}">
                            <div class="meal-img">
                                <img src="${meal.strMealThumb}" alt="food">
                            </div>
                            <div class="meal-name">
                                <h3>${meal.strMeal}</h3>
                                <a href="#" class="recipe-btn">Get Recipe</a>
                            </div>
                        </div>
                    `;
                });
                mealList.classList.remove('notFound');
            } else {
                displayError(mealList, "Sorry, we didn't find any meal!");
                mealList.classList.add('notFound');
            }
            mealList.innerHTML = html;
        })
        .catch(() => {
            hideLoading(mealList);
            displayError(mealList, "Something went wrong! Please try again later.");
        });
}

// Function to get meal recipe
function getMealRecipe(e) {
    e.preventDefault();
    if (e.target.classList.contains('recipe-btn')) {
        let mealItem = e.target.parentElement.parentElement;

        showLoading(mealDetailsContent); // Show loading in modal

        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
            .then(response => response.json())
            .then(data => {
                mealRecipeModal(data.meals);
            })
            .catch(() => {
                mealDetailsContent.innerHTML = "<p>Failed to fetch recipe details. Please try again later.</p>";
            })
            .finally(() => hideLoading(mealDetailsContent));
    }
}

function mealRecipeModal(meal) {
    meal = meal[0];
    let html = `
        <h2 class="recipe-title">${meal.strMeal}</h2>
        <p class="recipe-category">${meal.strCategory}</p>
        <div class="recipe-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <div class="recipe-meal-img">
            <img src="${meal.strMealThumb}" alt="">
        </div>
        <div class="recipe-link">
            <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
            <button type="button" class="btn save-btn" aria-label="Save this meal">Save Meal</button>
        </div>
    `;
    mealDetailsContent.innerHTML = html;
    mealDetailsContent.setAttribute('data-meal-id', meal.idMeal); // Set meal ID for saving
    
    showModal();

    
    const saveBtn = mealDetailsContent.querySelector('.save-btn');
    saveBtn.addEventListener('click', saveMeal);
}
