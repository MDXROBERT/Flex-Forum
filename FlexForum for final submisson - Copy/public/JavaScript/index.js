
$(function () {

    // Welcome hover effect
    $('#welcome').on('mouseenter', function () {
        $(this).css('text-decoration', 'underline');
    }).on('mouseleave', function () {
        $(this).css('text-decoration', 'none');
    });


    // Check for saved background in local storage on page load
    const savedBackground = localStorage.getItem('pageBackground');
    if (savedBackground) {
        document.body.style.backgroundImage = `url(${savedBackground})`;
    }

    // Trigger the file input when the button is clicked
    document.getElementById('changeBackgroundBtn').addEventListener('click', () => {
        document.getElementById('backgroundInput').click();
    });

    // When a file is selected, read it and change the background
    document.getElementById('backgroundInput').addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imageUrl = e.target.result;
                document.body.style.backgroundImage = `url(${imageUrl})`;
                // Save the image URL in local storage
                localStorage.setItem('pageBackground', imageUrl);
            };
            reader.readAsDataURL(file);
        }
    });

    // AJAX POST request for daily blog
    $('#dailyBlogForm').on('submit', function (e) {
        e.preventDefault();
        const blogText = $('#dailyBlogText').val();

        $.ajax({
            url: '/M00862854/postDailyBlog',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ text: blogText }),
            success: function (response) {
                console.log(response);
                fetchAndDisplayDailyBlogs(); // Refresh blogs display
                $('#dailyBlogText').val(''); // Clear the textarea
            },
            error: function (error) {
                console.error('Error posting blog:', error.responseText);
            }
        });
    });

    let currentBlogIndex = 0; // Tracks the current blog being displayed
    // Function to display the daily blog
    function displayBlog(blog) {
        const blogSection = $('#daily-blog .blog-post-content');
        blogSection.empty(); // Clear existing content

        const blogElement = $('<div>').addClass('blog-entry');
        blogElement.append($('<h3>').addClass('blog-post-title').text(blog.username + "'s blog"));
        blogElement.append($('<p>').addClass('blog-post-date').text(new Date(blog.date).toLocaleDateString()));
        blogElement.append($('<p>').text(blog.text));
        blogSection.append(blogElement);
    }
    // Function to fetch and display daily blogs
    function fetchAndDisplayDailyBlogs() {
        $.ajax({
            url: '/M00862854/getDailyBlogs',
            type: 'GET',
            success: function (blogs) {
                if (blogs.length === 0) {
                    console.log('No blogs to display.');
                    return;
                }
                // Reset index if it exceeds the number of blogs
                if (currentBlogIndex >= blogs.length) {
                    currentBlogIndex = 0;
                }

                displayBlog(blogs[currentBlogIndex]); // Display the current blog
                currentBlogIndex++; // Prepare index for next blog

                // Set up the next blog to be displayed in 2 minutes
                setTimeout(() => {
                    fetchAndDisplayDailyBlogs();
                }, 60000); // 120000 milliseconds = 2 minutes
            },
            error: function (error) {
                console.log('Error fetching daily blogs:', error);
            }
        });
    }

    fetchAndDisplayDailyBlogs();



    // AJAX GET request


    // Modals trigger
    $('#register').on('click', function () {
        $('#registerModal').modal('show');
    });
    // login Modal trigger
    $('#login').on('click', function () {
        $('#loginModal').modal('show');
    });

    // add post Modal trigger 
    $('#add-post').on('click', function () {
        $('#addPostModal').modal('show');
    });
    // posts Modal trigger
    $('#posts').on('click', function () {
        $('#postsGalleryModal').modal('show');
    }
    );

    fetchAndDisplayPosts();

    // Handle the add post form submission
    $('#addPostForm').on('submit', function (e) {
        e.preventDefault();

        let photoFile = $('#postImage').prop('files')[0];
        let text = $('#postText').val();
        let visibility = $('#postVisibility').val(); // Get the visibility setting

        let formData = new FormData();
        formData.append('photo', photoFile);
        formData.append('text', text);
        formData.append('visibility', visibility);

        // AJAX POST request for adding a post
        $.ajax({
            url: '/M00862854/uploadPost',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                $('#addPostModal').modal('hide');
                fetchAndDisplayPosts(); // Refresh the posts display
            },
            error: function (error) {
                console.error('Upload error:', error);
            }
        });
    });
    // Function to fetch and display posts
    function fetchAndDisplayPosts() {
        $.ajax({
            url: '/M00862854/getPosts',
            type: 'GET',
            success: function (posts) {
                var gallery = $('#gallery');
                gallery.empty();
                posts.forEach(function (post) {
                    const imgElement = $('<img>').attr('src', post.image).addClass('img-fluid');
                    const textElement = $('<p>').text(post.text).addClass('post-text');
                    const posterElement = $('<p>').addClass('poster-name').text(post.username + "'s post");
                    const likeButton = $('<button>').addClass('like-button').text('👍');
                    const likesCount = $('<span>').addClass('likes-count').text(post.likes || 0);
                    // AJAX POST request for liking a post
                    likeButton.on('click', function () {
                        $.ajax({
                            url: '/M00862854/likePost',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify({ postId: post._id }),
                            success: function () {

                                const newLikes = parseInt(likesCount.text()) + 1;
                                likesCount.text(newLikes);
                            },
                            error: function (error) {
                                console.log('Error liking the post:', error);
                            }
                        });
                    });

                    gallery.append($('<div>').addClass('post-container').append(posterElement, imgElement, textElement, likeButton, likesCount));
                });
            },
            error: function (error) {
                console.log('Error fetching posts:', error);
            }
        });
    }


    // Register form submission
    $('#registerForm').on('submit', function (e) {
        e.preventDefault();
        const userData = {
            username: $('#registerUsername').val(),
            email: $('#registerEmail').val(),
            password: $('#registerPassword').val(),
            phonenumber: $('#registerPhone').val(),
        };
        // AJAX POST request
        $.ajax({
            url: '/M00862854/register',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(userData),
            success: function (response) {
                console.log('Registration successful:', response);
                $('#registerModal').modal('hide');
            },
            error: function (error) {
                console.log('Registration error:', error);
                alert('Registration error:', error.responseText);
            }
        });
    });

    // Fetch and display the current user
    fetchAndDisplayCurrentUser();
    // Login form submission
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();
        const loginData = {
            email: $('#loginEmail').val(),
            password: $('#loginPassword').val(),
            phoneNumber: $('#loginPhoneNumber').val(),
        };
        // AJAX POST request for login
        $.ajax({
            url: '/M00862854/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(loginData),
            success: function (response) {
                console.log('Login successful:', response);

                alert('Login successful');

                window.location.reload();
            },
            error: function (error) {

                console.error('Login error:', error.responseText);
                alert('Login error: ' + error.responseText);
            }
        });
    });

    $('#userIcon').on('click', function () {
        // Show the modal
        $('#userInfoModal').modal('show');
    });

    // Fetch and display the current user
    function fetchAndDisplayCurrentUser() {
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
    //Feetch users
    $(function () {
        // Fetch and display users on page load and when load-users-btn is clicked
        async function fetchUsers() {
            try {
                const response = await fetch('/M00862854/getUsers');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const users = await response.json();
                displayUsers(users);
            } catch (e) {
                console.error('Fetch error: ' + e.message);
            }
        }

        // Display users in the user list
        function displayUsers(users) {
            const userListDiv = $('#user-list');
            userListDiv.empty();
            users.forEach(user => {
                let followButtonText = user.isFollowed ? "Following" : "Follow";
                let followButtonClass = user.isFollowed ? "follow-btn followed" : "follow-btn";
                userListDiv.append(`<p>${user.username} - ${user.email} <button class="${followButtonClass}" data-username="${user.username}">${followButtonText}</button></p>`);
            });
            // Show user list modal after updating the list
            $('#userListModal').modal('show');
        }

        // Follow user function
        async function followUser(usernameToFollow, button) {
            try {
                const response = await fetch('/M00862854/followUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ usernameToFollow }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                button.removeClass('follow-btn').addClass('followed').text('Following');
            } catch (e) {
                console.error('Follow request error: ' + e.message);
                alert("Failed to send follow request.");
            }
        }

        // Event listener for the load-users-btn click event
        $('#load-users-btn').on('click', fetchUsers);


        $('#user-list').on('click', '.follow-btn', function () {
            const button = $(this);
            const usernameToFollow = button.data('username');
            followUser(usernameToFollow, button);
        });


        fetchUsers();
    });




    // Function to fetch and display users in the chat sidebar
    function fetchAndDisplayUsers() {
        $.ajax({
            url: '/M00862854/getUsers',
            type: 'GET',
            success: function (users) {
                const userList = $('#pr-pals .chat-messages');
                $('#back-to-users').hide();
                userList.empty();
                users.forEach(function (user) {
                    if (user.username !== $('#loggedInUser span').text()) {
                        const userDiv = $('<div>').addClass('user').data('username', user.username).text(user.username);
                        userList.append(userDiv);
                    }
                });
            },
            error: function (error) {
                console.log('Error fetching users:', error);
            }
        });
    }

    // Call fetchAndDisplayUsers on page load
    fetchAndDisplayUsers();

    // Variable to store the username of the selected user
    let selectedUser = null;

    // Click event to select a user from the list
    $('#pr-pals').on('click', '.user', function () {
        selectedUser = $(this).data('username');
        $('.user').removeClass('selected');
        $(this).addClass('selected');
        $('#message-input').focus();
        $('#back-to-users').show(); // Show the back button when a user is selected
        $('#message-input-form').show(); // Show the message input form when a user is selected
        fetchAndDisplayMessages(); // Fetch the messages for the selected conversation
    });

    $('#back-to-users').on('click', function () {
        selectedUser = null;
        $(this).hide(); // Hide the back button
        $('#message-input-form').hide(); // Hide the message input form
        $('#chat-messages').empty(); // Clear the messages
        fetchAndDisplayUsers(); // Refresh the user list
    });

    // Send message on form submit
    $('#message-input-form').on('submit', function (e) {
        e.preventDefault();
        const messageText = $('#message-input').val();
        if (!selectedUser) {
            alert('Please select a user to message.');
            return;
        }
        if (messageText) {
            const messagePayload = {
                receiver: selectedUser,
                content: messageText
            };
            $.ajax({
                url: '/M00862854/sendMessage',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(messagePayload),
                success: function () {
                    $('#message-input').val('');
                    fetchAndDisplayMessages(); // Refresh the message display
                },
                error: function (error) {
                    console.error('Error sending message:', error);
                }
            });
        }
    });

    // Function to fetch and display messages
    function fetchAndDisplayMessages() {
        if (!selectedUser) return; // Exit if no user is selected
        const currentUser = $('#loggedInUser span').text(); // Logged-in user's username

        $.ajax({
            url: '/M00862854/getMessages',
            type: 'GET',
            data: {
                chatWith: selectedUser // Pass the selected user to chat with
            },
            success: function (messages) {
                const messageContainer = $('#chat-messages');
                messageContainer.empty(); // Clear the container before adding new messages
                messages.forEach(function (message) {
                    const messageDiv = $('<div>').addClass('message');
                    if (message.sender === currentUser) {
                        messageDiv.addClass('sent').text(`You: ${message.content}`);
                    } else {
                        messageDiv.addClass('received').text(`${selectedUser}: ${message.content}`);
                    }
                    messageContainer.append(messageDiv); // Append each message to the container
                });
            },
            error: function (error) {
                console.log('Error fetching messages:', error);
            }
        });
    }

    // Function to fetch and display posts
    $('#searchBtn').on('click', function () {
        const searchQuery = $('#searchInput').val().trim();
        const resultsContainer = $('#searchResultsBody');

        if (searchQuery) {
            $.ajax({
                url: `/M00862854/search?searchQuery=${encodeURIComponent(searchQuery)}`,
                type: 'GET',
                success: function (posts) {
                    resultsContainer.empty();

                    if (posts.length === 0) {
                        resultsContainer.append('<p>No posts found.</p>');
                    } else {
                        posts.forEach(post => {
                            const postImage = post.image ? `<img src="${post.image}" class="img-fluid" alt="Post Image" />` : '';
                            const postElement = $(`
                                <div class="post">
                                    <h4>${post.username}'s post</h4>
                                    ${postImage}
                                    <p>${post.text}</p>
                                    <p>Visibility: ${post.visibility}</p>
                                </div>
                            `);
                            resultsContainer.append(postElement);
                        });
                    }
                    $('#searchResultsModal').modal('show');
                },
                error: function (error) {
                    console.error('Search error:', error);
                    resultsContainer.html('<p>An error occurred during the search.</p>');
                }
            });
        }
    });

    // Logout button click event
    $('#logoutBtn').on('click', function () {
        $.ajax({
            url: '/M00862854/logout',
            type: 'POST',
            success: function (response) {
                console.log(response);
                alert('Logged out successfully. The page will now refresh.');
                // Refresh the page
                window.location.reload();
            },
            error: function (xhr, status, error) {
                console.error('Logout failed:', status, error);
                alert('Logout failed. Please try again.');
            }
        });
    });




    $('#userIcon').on('click', function () {
        // Show the modal
        $('#userInfoModal').modal('show');
    });

});
