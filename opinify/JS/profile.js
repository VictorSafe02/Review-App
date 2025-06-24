console.log("profile.js loaded!");
document.addEventListener("DOMContentLoaded", function () {
  setActiveNavLink();

  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("id");
  const viewingOwnProfile = !userId;
  console.log(userId);
  loadProfileData(userId);
  setupProfileEventListeners(viewingOwnProfile, urlParams);
  loadSection("reviews");
  if (viewingOwnProfile) {
    setupDeleteAccount();
  }
});

function getLoggedInUserId() {
  return getUserIdPromise();
}

function loadProfileData(userIdFromUrl) {
  console.log("loadProfileData: START - userIdFromUrl:", userIdFromUrl);
  let userIdToUse = userIdFromUrl;

  if (!userIdToUse) {
    getLoggedInUserId()
      .then((loggedInUserId) => {
        if (!loggedInUserId) {
          console.error("loadProfileData: Could not determine user ID.");
          alert("Could not load profile data.");
          return;
        }
        userIdToUse = loggedInUserId;
        console.log(
          "loadProfileData: Using logged-in user ID:",
          loggedInUserId
        );
        fetchData(userIdToUse);
      })
      .catch((error) => {
        console.error(
          "loadProfileData: Error getting logged-in user ID:",
          error
        );
        alert("Could not load profile data.");
      });
  } else {
    console.log("loadProfileData: Using URL user ID:", userIdToUse);
    fetchData(userIdToUse);
  }

  function fetchData(finalUserId) {
    const fetchProfileUrl = userIdFromUrl
      ? `../api/get_profile_data.php?user_id=${userIdFromUrl}`
      : "../api/get_profile_data.php";

    console.log("fetchData: Fetching from:", fetchProfileUrl);

    const profilePromise = fetch(fetchProfileUrl)
      .then(handleResponse)
      .then((userData) => {
        if (userData) {
          console.log(
            "fetchData: profilePromise userData (before display):",
            userData
          );
          displayProfile(userData);
          if (!userIdFromUrl) {
            loadSettings(userData);
          }
          console.log(
            "fetchData: profilePromise userData (after display):",
            userData
          );
          return userData;
        } else {
          console.error("Failed to fetch profile data");
          throw new Error("Failed to fetch profile data");
        }
      });

    const reviewsPromise = fetchReviews(finalUserId);
    const favoritesPromise = fetchFavorites(finalUserId);
    const followersPromise = fetchFollowers(finalUserId);
    const followingPromise = fetchFollowing(finalUserId);

    Promise.all([
      profilePromise,
      reviewsPromise,
      favoritesPromise,
      followersPromise,
      followingPromise,
    ])
      .then((results) => {
        console.log("Promise.all: All profile data loaded.");
        const userData = results[0];
        console.log("Promise.all: userData =", JSON.stringify(userData));
        setFollowButtonState(userData.isFollowing);
        console.log(
          "Promise.all: userData.isFollowing =",
          userData.isFollowing
        );
        console.log("loadProfileData: END - finalUserId:", finalUserId);
      })
      .catch((error) => {
        console.error("Error loading profile data:", error);
        alert("Failed to load profile data. Please try again.");
        console.log(
          "loadProfileData: END (ERROR) - finalUserId:",
          finalUserId,
          "Error:",
          error
        );
      });
  }
}

function setFollowButtonState(isFollowing) {
  const followBtn = document.getElementById("follow-btn");
  if (!followBtn) {
    console.warn("setFollowButtonState: follow-btn not found in DOM!");
    return;
  }

  console.log("setFollowButtonState: isFollowing =", isFollowing);

  if (isFollowing) {
    followBtn.textContent = "Following";
    followBtn.classList.add("following");
  } else {
    followBtn.textContent = "Follow";
    followBtn.classList.remove("following");
  }
}

function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return response.json();
}

function fetchReviews(userId) {
  const reviewsUrl = `../api/get_profile_reviews.php?mode=${getCurrentMode()}&user_id=${userId}`;
  console.log("fetchReviews: Fetching reviews from:", reviewsUrl);
  fetch(reviewsUrl)
    .then((response) => {
      console.log("fetchReviews: Response:", response);
      return response.json();
    })
    .then((reviews) => {
      console.log("fetchReviews: Data:", reviews);
      displayReviews(reviews);
    })
    .catch((error) => console.error("Error fetching reviews:", error));
}

function fetchFavorites(userId) {
  const favoritesUrl = `../api/get_favourites.php?mode=${getCurrentMode()}&user_id=${userId}`;
  fetch(favoritesUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response.json();
    })
    .then((favorites) => {
      console.log("fetchFavorites:", favorites);
      displayFavorites(favorites);
    })
    .catch((error) => {
      console.error("Error fetching favorites:", error);
      alert("Failed to load favorites. Please try again.");
    });
}

function fetchFollowers(userId) {
  const followersUrl = `../api/get_followers.php?user_id=${userId}`;
  fetch(followersUrl)
    .then((response) => response.json())
    .then((followers) => {
      displayFollowers(followers);
    })
    .catch((error) => console.error("Error fetching followers:", error));
}

function fetchFollowing(userId) {
  const followingUrl = `../api/get_following.php?user_id=${userId}`;
  fetch(followingUrl)
    .then((response) => response.json())
    .then((following) => {
      displayFollowing(following);
    })
    .catch((error) => console.error("Error fetching following:", error));
}

function displayProfile(userData) {
  console.log("displayProfile: START - userData:", userData);
  const {
    username,
    profilePicture,
    join_date,
    reviewCount,
    followerCount,
    followingCount,
    isFollowing,
  } = userData;

  console.log(
    "displayProfile: followerCount:",
    followerCount,
    "followingCount:",
    followingCount,
    "isFollowing:",
    isFollowing
  );

  document.getElementById("username").textContent = username;
  document.getElementById("profile-picture").src = profilePicture || "";
  document.getElementById("join-date").textContent = new Date(
    join_date
  ).toLocaleDateString("en-US", { year: "numeric", month: "long" });
  document.getElementById("review-count").textContent = reviewCount;
  document.getElementById("follower-count").textContent = followerCount;
  document.getElementById("following-count").textContent = followingCount;

  console.log("displayProfile: END");
}

function displayReviews(reviews) {
  const container = document.getElementById("user-reviews-list");
  container.innerHTML = "";

  if (!Array.isArray(reviews) || reviews.length === 0) {
    container.innerHTML = "<p>No reviews yet.</p>";
    return;
  }

  container.innerHTML = reviews
    .map((review) => {
      const ratingDisplay =
        typeof review.rating === "number"
          ? "★".repeat(Math.floor(review.rating)) +
            "☆".repeat(5 - Math.floor(review.rating))
          : "No Rating";
      const reviewDate = review.review_date
        ? formatDate(review.review_date)
        : "Date Unavailable";

      return `
            <section class="user-review">
                <section class="review-header">
                    <section>
                        <span class="review-item">${review.item_title}
                            <span class="review-date">${reviewDate}</span>
                        </span>
                    </section>
                    <section class="review-rating">
                        ${ratingDisplay}
                    </section>
                </section>
                <section class="review-content">${review.content}</section>
            </section>
        `;
    })
    .join("");
}

function displayFavorites(favorites) {
  const container = document.getElementById("favorites-container");
  container.innerHTML = "";

  if (!Array.isArray(favorites) || favorites.length === 0) {
    container.innerHTML = "<p>No favorites yet.</p>";
    return;
  }

  container.innerHTML = favorites
    .map((favorite) => {
      let ratingDisplay = "";
      let ratingValue = parseFloat(favorite.rating);

      if (isNaN(ratingValue)) {
        console.warn("Favorite item has no valid rating: ", favorite);
        ratingDisplay = "No rating";
      } else {
        ratingDisplay = `${"★".repeat(
          Math.floor(ratingValue)
        )}${ratingValue.toFixed(1)}`;
      }

      return `
            <section class="favorite-item">
                <img src="${favorite.image}" alt="${
        favorite.title
      }" class="favorite-image">
                <section class="favorite-info">
                    <h3 class="favorite-title">${favorite.title}</h3>
                    <p class="favorite-meta">
                        ${
                          favorite.type === "book"
                            ? `by ${favorite.author}`
                            : favorite.type
                        }
                    </p>
                    <section class="favorite-rating">
                        ${ratingDisplay}
                    </section>
                </section>
            </section>
        `;
    })
    .join("");
}

function displayFollowers(followers) {
  const container = document.getElementById("followers-list");
  container.innerHTML = "";

  if (!Array.isArray(followers) || followers.length === 0) {
    container.innerHTML = "<p>No followers yet.</p>";
    return;
  }

  container.innerHTML = followers
    .map(
      (follower) => `
        <a href="../HTML/user_profile.html?id=${
          follower.user_id
        }" class="user-card" style="text-decoration: none; color: inherit;">
            <img src="${
              follower.profile_picture_url || ""
            }" alt="Profile Picture" class="user-avatar">
            <section class="user-info">
                <h3 class="user-name">${follower.username}</h3>
                <p class="user-stats">
                    ${follower.followerCount} Followers <br> ${
        follower.followingCount
      } Following
                </p>
            </section>
            <button class="user-action-btn">
                ${follower.isFollowing ? "Following" : "Follow"}
            </button>
        </a>
    `
    )
    .join("");
}

function displayFollowing(following) {
  const container = document.getElementById("following-list");
  container.innerHTML = "";

  if (!Array.isArray(following) || following.length === 0) {
    container.innerHTML = "<p>No one followed yet.</p>";
    return;
  }

  container.innerHTML = following
    .map(
      (follow) => `
        <a href="../HTML/user_profile.html?id=${
          follow.user_id
        }" class="user-card" style="text-decoration: none; color: inherit;">
            <img src="${
              follow.profile_picture_url || ""
            }" alt="Profile Picture" class="user-avatar">
            <section class="user-info">
                <h3 class="user-name">${follow.username}</h3>
                <p class="user-stats">
                    ${follow.followerCount} Followers <br> ${
        follow.followingCount
      } Following
                </p>
            </section>
            <button class="user-action-btn">
                ${follow.isFollowing ? "Following" : "Follow"}
            </button>
        </a>
    `
    )
    .join("");
}

function loadSettings(userData) {
  if (!userData) {
    console.error("loadSettings: userData is undefined or null");
    return;
  }

  const {
    username,
    email,
    publicProfile,
    showActivity,
    allow_followers,
    email_notifications,
    follower_notifications,
    like_notifications,
    recommendation_notifications,
  } = userData;

  const usernameInput = document.getElementById("username-input");
  const emailInput = document.getElementById("email-input");
  if (usernameInput) usernameInput.value = username;
  if (emailInput) emailInput.value = email;

  const publicProfileCheckbox = document.getElementById("public-profile");
  const activityStatusCheckbox = document.getElementById("activity-status");
  const allowFollowersCheckbox = document.getElementById("allow-followers");

  if (publicProfileCheckbox) publicProfileCheckbox.checked = publicProfile;
  if (activityStatusCheckbox) activityStatusCheckbox.checked = showActivity;
  if (allowFollowersCheckbox) allowFollowersCheckbox.checked = allow_followers;

  const emailNotificationsCheckbox = document.getElementById(
    "email-notifications"
  );
  const followerNotificationsCheckbox = document.getElementById(
    "follower-notifications"
  );
  const likeNotificationsCheckbox =
    document.getElementById("like-notifications");
  const recommendationNotificationsCheckbox = document.getElementById(
    "recommendation-notifications"
  );

  if (emailNotificationsCheckbox)
    emailNotificationsCheckbox.checked = email_notifications === 1;
  if (followerNotificationsCheckbox)
    followerNotificationsCheckbox.checked = follower_notifications === 1;
  if (likeNotificationsCheckbox)
    likeNotificationsCheckbox.checked = like_notifications === 1;
  if (recommendationNotificationsCheckbox)
    recommendationNotificationsCheckbox.checked =
      recommendation_notifications === 1;
}

function setupProfileEventListeners(viewingOwnProfile, urlParams) {
  document.querySelectorAll(".profile-nav-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".profile-nav-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      loadSection(this.dataset.section);
    });
  });

  const followBtn = document.getElementById("follow-btn");
  if (followBtn) {
    if (viewingOwnProfile) {
      followBtn.style.display = "none";
    } else {
      followBtn.addEventListener("click", function () {
        const isFollowing = this.classList.contains("following");
        const userId = urlParams.get("id");
        getLoggedInUserId().then((myUserId) => {
          if (!myUserId) {
            alert("You must be logged in to follow/unfollow.");
            return;
          }

          const url = isFollowing
            ? `../api/unfollow_user.php?following_id=${userId}`
            : `../api/follow_user.php?following_id=${userId}`;

          fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ follower_id: myUserId }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Follow/Unfollow Data:", data);
              if (data.error) {
                alert(data.error);
              } else {
                loadProfileData(userId);
              }
            })
            .catch((error) => {
              console.error("Error during follow/unfollow:", error);
              alert("Error occurred. Please try again.");
            });
        });
      });
    }
  }

  document.querySelectorAll(".view-option").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".view-option")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      const view = this.dataset.view;
      const container = document.getElementById("favorites-container");
      container.classList.remove("grid-view", "list-view");
      container.classList.add(`${view}-view`);
      document.querySelectorAll(".favorite-item").forEach((item) => {
        item.classList.remove("grid-view", "list-view");
        item.classList.add(`${view}-view`);
      });
    });
  });

  const settingsMenu = document.querySelector(".settings-menu");
  if (settingsMenu) {
    if (!viewingOwnProfile) {
      settingsMenu.style.display = "none";
    } else {
      document.querySelectorAll(".settings-btn").forEach((btn) => {
        btn.addEventListener("click", function (e) {
          if (this.id === "logout-btn") return;
          e.preventDefault();
          document
            .querySelectorAll(".settings-btn")
            .forEach((b) => b.classList.remove("active"));
          this.classList.add("active");
          document
            .querySelectorAll(".settings-content")
            .forEach((content) => content.classList.remove("active"));
          document.getElementById(this.dataset.tab).classList.add("active");
        });
      });
    }
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    if (!viewingOwnProfile) {
      logoutBtn.style.display = "none";
    } else {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        fetch("../api/logout.php")
          .then((response) => response.json())
          .then((data) => {
            if (data.message === "Logged out successfully") {
              window.location.href = "login.html";
            } else {
              console.error("Logout failed:", data);
              alert("Logout failed. Please try again.");
            }
          })
          .catch((error) => {
            console.error("Error during logout:", error);
            alert("Error during logout. Please try again.");
          });
      });
    }
  }

  const uploadPictureBtn = document.getElementById("upload-picture-btn");
  if (uploadPictureBtn) {
    if (!viewingOwnProfile) {
      uploadPictureBtn.style.display = "none";
    } else {
      uploadPictureBtn.addEventListener("click", () => {
        const fileInput = document.getElementById("profile-picture-upload");
        const file = fileInput.files[0];

        if (!file) {
          alert("Please select a file to upload.");
          return;
        }

        const formData = new FormData();
        formData.append("profile_picture", file);

        fetch("../api/upload_profile_picture.php", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              document.getElementById("profile-picture").src =
                data.profile_picture_url;
              alert("Profile picture updated successfully!");
            } else {
              alert("File upload failed: " + data.error);
            }
          })
          .catch((error) => {
            console.error("Error uploading file:", error);
            alert("Error uploading file.");
          });
      });
    }
  }
  if (viewingOwnProfile) {
    setupDeleteAccount();
    setupAccountUpdate();
    setupPasswordUpdate();
    setupPrivacyUpdate();
    setupNotificationUpdate();
  }
}

function setupDeleteAccount() {
  const deleteAccountBtn = document.getElementById("delete-account-btn");
  if (!deleteAccountBtn) return;

  const deleteAccountModal = document.getElementById("delete-account-modal");
  const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
  const deleteAccountForm = document.getElementById("delete-account-form");

  deleteAccountBtn.addEventListener("click", () => {
    deleteAccountModal.style.display = "flex";
  });

  cancelDeleteBtn.addEventListener("click", () => {
    deleteAccountModal.style.display = "none";
  });

  deleteAccountModal.addEventListener("click", (e) => {
    if (e.target === deleteAccountModal) {
      deleteAccountModal.style.display = "none";
    }
  });

  if (deleteAccountForm) {
    deleteAccountForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const password = document.getElementById("delete-password").value;
      if (!password) {
        alert("Please enter your password to confirm.");
        return;
      }
      deleteAccount(password);
    });
  }
}

function deleteAccount(password) {
  getLoggedInUserId().then((userId) => {
    if (!userId) {
      console.error("deleteAccount: User ID not found. Cannot delete account.");
      alert("You are not logged in. Cannot delete account.");
      return;
    }

    fetch("../api/delete_account.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: password, userId: userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert("Delete Account Error: " + data.error);
        } else {
          alert(data.message);
          window.location.href = "../HTML/home.html";
        }
      })
      .catch((error) => {
        console.error("Error deleting account:", error);
        alert("An error occurred while deleting your account.");
      })
      .finally(() => {
        const deleteAccountModal = document.getElementById(
          "delete-account-modal"
        );
        if (deleteAccountModal) {
          deleteAccountModal.style.display = "none";
        }
      });
  });
}

function loadSection(section) {
  document
    .querySelectorAll(".profile-section")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(`${section}-section`).classList.add("active");
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function getCurrentMode() {
  return localStorage.getItem("opinifyMode") || "movies";
}

function getUserIdPromise() {
  return (
    userIdPromise ||
    (userIdPromise = new Promise((resolve) => {
      const userId = localStorage.getItem("user_id");
      if (userId) return resolve(userId);
      const intervalId = setInterval(() => {
        const userId = localStorage.getItem("user_id");
        if (userId) {
          clearInterval(intervalId);
          resolve(userId);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(intervalId);
        resolve(null);
      }, 5000);
    }))
  );
}

function setupAccountUpdate() {
  const accountForm = document.getElementById("account-form");
  const accountUpdateMessage = document.getElementById(
    "account-update-message"
  );

  if (accountForm) {
    accountForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const username = document.getElementById("username-input").value;
      const email = document.getElementById("email-input").value;

      if (!username || !email) {
        accountUpdateMessage.textContent = "Please fill in all fields.";
        accountUpdateMessage.style.color = "red";
        return;
      }

      const updateData = {
        username: username,
        email: email,
      };

      fetch("../api/update_account.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error("Account update error:", data.error);
            accountUpdateMessage.textContent =
              "Error updating account: " + data.error;
            accountUpdateMessage.style.color = "red";
          } else {
            accountUpdateMessage.textContent = "Account updated successfully!";
            accountUpdateMessage.style.color = "green";

            document.getElementById("username").textContent = username;

            loadProfileData();
          }
        })
        .catch((error) => {
          console.error("Fetch error:", error);
          accountUpdateMessage.textContent =
            "An error occurred while updating your account.";
          accountUpdateMessage.style.color = "red";
        });
    });
  }
}

document.addEventListener("DOMContentLoaded", setupAccountUpdate);

function setupPasswordUpdate() {
  const passwordForm = document.getElementById("password-form");
  const currentPasswordInput = document.getElementById("current-password");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const passwordUpdateMessage = document.getElementById(
    "password-update-message"
  );

  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const currentPassword = currentPasswordInput.value;
      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      if (!currentPassword || !newPassword || !confirmPassword) {
        passwordUpdateMessage.textContent = "Please fill in all fields.";
        passwordUpdateMessage.style.color = "red";
        return;
      }

      if (newPassword !== confirmPassword) {
        passwordUpdateMessage.textContent = "New passwords do not match.";
        passwordUpdateMessage.style.color = "red";
        return;
      }

      if (newPassword.length < 8) {
        passwordUpdateMessage.textContent =
          "New password must be at least 8 characters long.";
        passwordUpdateMessage.style.color = "red";
        return;
      }

      const updateData = {
        currentPassword: currentPassword,
        newPassword: newPassword,
      };

      try {
        const response = await fetch("../api/update_password.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        const data = await response.json();

        if (data.error) {
          console.error("Password update error:", data.error);
          passwordUpdateMessage.textContent =
            "Error updating password: " + data.error;
          passwordUpdateMessage.style.color = "red";
        } else {
          passwordUpdateMessage.textContent = "Password updated successfully!";
          passwordUpdateMessage.style.color = "green";
          //  Clear the form
          passwordForm.reset();
        }
      } catch (error) {
        console.error("Fetch error:", error);
        passwordUpdateMessage.textContent =
          "An error occurred while updating your password.";
        passwordUpdateMessage.style.color = "red";
      }
    });
  }
}

function setupPrivacyUpdate() {
  const privacyForm = document.getElementById("privacy-form");
  const publicProfileCheckbox = document.getElementById("public-profile");
  const activityStatusCheckbox = document.getElementById("activity-status");
  const allowFollowersCheckbox = document.getElementById("allow-followers");
  const privacyUpdateMessage = document.getElementById(
    "privacy-update-message"
  );

  if (privacyForm) {
    privacyForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const publicProfile = publicProfileCheckbox.checked;
      const showActivity = activityStatusCheckbox.checked;
      const allowFollowers = allowFollowersCheckbox.checked;

      const updateData = {
        publicProfile: publicProfile,
        showActivity: showActivity,
        allowFollowers: allowFollowers,
      };

      try {
        const response = await fetch("../api/update_privacy.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        const data = await response.json();

        if (data.error) {
          console.error("Privacy update error:", data.error);
          privacyUpdateMessage.textContent =
            "Error updating privacy settings: " + data.error;
          privacyUpdateMessage.style.color = "red";
        } else {
          privacyUpdateMessage.textContent =
            "Privacy settings updated successfully!";
          privacyUpdateMessage.style.color = "green";

          loadProfileData();
        }
      } catch (error) {
        console.error("Fetch error:", error);
        privacyUpdateMessage.textContent =
          "An error occurred while updating privacy settings.";
        privacyUpdateMessage.style.color = "red";
      }
    });
  }
}

function setupNotificationUpdate() {
  const notificationForm = document.getElementById("notification-form");
  const emailNotificationsCheckbox = document.getElementById(
    "email-notifications"
  );
  const followerNotificationsCheckbox = document.getElementById(
    "follower-notifications"
  );
  const likeNotificationsCheckbox =
    document.getElementById("like-notifications");
  const recommendationNotificationsCheckbox = document.getElementById(
    "recommendation-notifications"
  );
  const notificationUpdateMessage = document.getElementById(
    "notification-update-message"
  );

  if (notificationForm) {
    notificationForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const emailNotifications = emailNotificationsCheckbox.checked;
      const followerNotifications = followerNotificationsCheckbox.checked;
      const likeNotifications = likeNotificationsCheckbox.checked;
      const recommendationNotifications =
        recommendationNotificationsCheckbox.checked;
      console.log(
        emailNotifications +
          " " +
          followerNotifications +
          " " +
          likeNotifications +
          " " +
          recommendationNotifications
      );
      const updateData = {
        emailNotifications: emailNotifications,
        followerNotifications: followerNotifications,
        likeNotifications: likeNotifications,
        recommendationNotifications: recommendationNotifications,
      };

      try {
        const response = await fetch("../api/update_notifications.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        const data = await response.json();

        if (data.error) {
          console.error("Notification update error:", data.error);
          notificationUpdateMessage.textContent =
            "Error updating notification preferences: " + data.error;
          notificationUpdateMessage.style.color = "red";
        } else {
          notificationUpdateMessage.textContent =
            "Notification preferences updated successfully!";
          notificationUpdateMessage.style.color = "green";

          loadProfileData();
        }
      } catch (error) {
        console.error("Fetch error:", error);
        notificationUpdateMessage.textContent =
          "An error occurred while updating notification preferences.";
        notificationUpdateMessage.style.color = "red";
      }
    });
  }
}
