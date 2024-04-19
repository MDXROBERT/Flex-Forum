export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function getNextBlogIndex(currentIndex, totalBlogs) {
  return currentIndex >= totalBlogs - 1 ? 0 : currentIndex + 1;
}

// Function to create blog HTML
export function createBlogHtml(blog) {
  return `
      <div class="blog-entry">
        <h3 class="blog-post-title">${blog.username}'s blog</h3>
        <p class="blog-post-date">${new Date(blog.date).toLocaleDateString()}</p>
        <p>${blog.text}</p>
      </div>
    `;
}

export function isValidPhoneNumber(phoneNumber) {
  const regex = /^\d{10}$/;
  return regex.test(phoneNumber);
}

export function displayUsers(users) {
  const userListDiv = $('#user-list');
  userListDiv.empty();
  users.forEach(user => {
    let followButtonText = user.isFollowed ? "Following" : "Follow";
    let followButtonClass = user.isFollowed ? "follow-btn followed" : "follow-btn";
    userListDiv.append(`<p>${user.username} - ${user.email} <button class="${followButtonClass}" data-username="${user.username}">${followButtonText}</button></p>`);
  });
}


export function fetchAndDisplayCurrentUser() {
  $.ajax({
    url: '/M00862854/currentUser',
    type: 'GET',
    success: function (response) {
      if (response.isLoggedIn) {
        if (response.user && response.user.username) {
          $('#loggedInUser span').text(response.user.username);
        } else {
          $('#loggedInUser span').text('Username not available');
        }
      } else {
        $('#loggedInUser span').text('Not logged in');
      }
    },
    error: function () {
      $('#loggedInUser span').text('Status unknown');
    }
  });
}