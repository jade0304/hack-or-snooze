"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, deleteBtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const showStar = Boolean(currentUser)

  return $(`
        <li id="${story.storyId}">
        ${deleteBtn ? deleteBtnHtml() : ""}
        ${showStar ? favStar(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

// create delete button HTML for story
function deleteBtnHtml(){
  return `
  <span class="trash-can">
  <i class="fas fa-trash-alt" id="trash-can"></i>
  </span>`;
}

function favStar(story, user){
  const isFavorite = user.isFavorite(story)
  const starType = isFavorite ? `<span class="star"><i class="fas fa-star"></i></span>` : `<span class="star"><i class="far fa-star"></i></span>`
  return starType
  
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function deleteStory(evt) {
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList. removeStory(currentUser, storyId);

  await putUserStoriesOnPage();
}

$myStories.on("click", ".trash-can", deleteStory);


// Submit new story
async function submitNewStory(evt) {
  console.debug("submitNewStory")
  evt.preventDefault();

  const title = $("#submit-title").val()
  const author = $("#submit-author").val()
  const url = $("#submit-url").val()
  const username = currentUser.username
  const storyData = {title, author, url, username};

  const story = await storyList.addStory(currentUser, storyData);
  
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $submitForm.hide();
  $submitForm.trigger("reset");
};

$submitForm.on("submit", submitNewStory);



// Users own story list
function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $myStories.empty();

  // loop through all of our stories and generate HTML for them
  if (currentUser.ownStories.length === 0){
    $myStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(story, true);
      $myStories.append($story);
    }
  }

  $myStories.show();
}


function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favStoriesList.empty();

  if (currentUser.favorites.length === 0) {
    $favStoriesList.append("<h5>No favorites added!</h5>");
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favStoriesList.append($story);
  }
}

$favStoriesList.show()

}

async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $target = $(evt.target);
  const $closestLi = $target.closest("li");
  const storyId = $closestLi.attr('id');
  const story = storyList.stories.find(s => s.storyId === storyId);

  // see if item is favorited (checking by presence of star)
  if ($target.hasClass("fas")) {
    // currently a favorite: remove from user's fav listv and change star
    await currentUser.removeFavorite(story);
    $target.closest("i").toggleClass("fas far")
  } else {
    await currentUser.addFavorite(story);
    $target.closest("i").toggleClass("fas far");
  }
}

$storiesLists.on("click", ".star", toggleStoryFavorite);