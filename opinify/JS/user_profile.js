const followBtn = document.getElementById("follow-btn");
if (followBtn) {
  if (viewingOwnProfile) {
    followBtn.style.display = "none";
  } else {
    followBtn.addEventListener("click", function () {
      const isFollowing = this.classList.contains("following");
      const profileUserId = urlParams.get("id");
      getLoggedInUserId().then((currentUserId) => {
        if (!currentUserId) {
          console.error("Not logged in.");
          alert("You must be logged in to follow/unfollow.");
          return;
        }

        const url = isFollowing
          ? `../api/unfollow_user.php?following_id=${profileUserId}`
          : `../api/follow_user.php?following_id=${profileUserId}`;

        console.log(`[Follow Button] URL: ${url}`);
        console.log(`[Follow Button] isFollowing: ${isFollowing}`);
        console.log(`[Follow Button] profileUserId: ${profileUserId}`);
        console.log(`[Follow Button] currentUserId: ${currentUserId}`);

        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ follower_id: currentUserId }),
        })
          .then((response) => {
            console.log("[Fetch Response]", response);
            if (!response.ok) {
              return response.text().then((text) => {
                throw new Error(text);
              });
            }
            return response.json();
          })
          .then((data) => {
            console.log("[Fetch Data]", data);
            if (data.error) {
              console.error("API Error:", data.error);
              alert("Error: " + data.error);
            } else {
              this.textContent = isFollowing ? "Follow" : "Following";
              this.classList.toggle("following", !isFollowing);
              loadProfileData(profileUserId);
            }
          })
          .catch((error) => {
            console.error("Fetch Error:", error);
            alert("Error occurred: " + error);
          });
      });
    });
  }
}
